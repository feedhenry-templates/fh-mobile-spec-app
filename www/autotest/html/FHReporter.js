jasmine.FHReporter = function(){
  var self = this;

  var fh = window.$fh;
  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };
  })();

  var reporterId = guid();

  var reportsCache = [];
  var limit = 10;
  var totalSpecs;
  var specCounter=0;
  var order = 0;
  var failedSpecs=0;
  var passedSpecs=0;
  var skippedSpecs=0;
  var suitesMap = {};

  function sendReport(testData, force){
    testData.order = order++;
    testData.ts = new Date().getTime();
    testData.progress = {
      total: totalSpecs,
      run: specCounter
    };
    reportsCache.push(testData);
    if(reportsCache.length === limit || force){
      var dataToSend = reportsCache.splice(0, limit);
      var reqData = {};
      reqData.reporterId = reporterId;
      reqData.deviceInfo = window.device || {};
      reqData.testInfo = dataToSend;
      fh.cloud({
        path: '/recordTest',
        method: 'POST',
        contentType: 'application/json',
        data: reqData
      }, function(res){
        self.log('[FHReporter] Update success');
      }, function(msg, err){
        self.log('[FHReporter] Update failed - ' + msg);
      });
    }
  };

  self.log = function(){
    var console = jasmine.getGlobal().console;
    if (console && console.log) {
      if (console.log.apply) {
        console.log.apply(console, arguments);
      } else {
        console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
      }
    }
  };

  self.reportRunnerStarting = function(runner){
    var specs = runner.specs() || [];
    totalSpecs = specs.length;
    sendReport({
      stage: 'runner_starting'
    });
  };

  self.reportRunnerResults = function(runner){
    self.log('Runner completed');
    var results = runner.results();
    var passed = results.passed();
    var totalCount = results.totalCount;
    var passedCount = results.passedCount;
    var failedCount = results.failedCount;
    sendReport({
      stage: 'complete',
      data: {
        'total_specs': totalSpecs,
        'passed_specs': passedSpecs,
        'skipped_specs': skippedSpecs,
        'failed_specs': failedSpecs,
        'total_asserts': totalCount,
        'passed_asserts': passedCount,
        'failed_asserts': failedCount,
        'passed': passed
      }
    }, true);
  };

  self.reportSuiteResults = function(suite){
    var suiteId = suite.id;
    var fullName = suite.getFullName();
    var results = suite.results();
    var passed = results.passed();
    var totalCount = results.totalCount;
    var passedCount = results.passedCount;
    var failedCount = results.failedCount;
    var skipped = results.skipped;
    sendReport({
      stage: 'suite_complete',
      data: {
        suiteId: suiteId,
        name: fullName,
        desc: suite.description,
        passed: passed,
        totalCount: totalCount,
        passedCount: passedCount,
        failedCount: failedCount,
        skipped : skipped,
        parents: getSuiteParents(suite),
        specs: suitesMap[suiteId]
      }
    });
  };

  self.reportSpecStarting = function(spec){
    specCounter++;
  };

  self.reportSpecResults = function(spec){
    var results = spec.results();
    var passed = results.passed();
    if(results.skipped){
      skippedSpecs++;
    }
    if(!passed){
      failedSpecs++;
    } else {
      passedSpecs++;
    }

    var suiteId = spec.suite.id;
    if(!suitesMap[suiteId]){
      suitesMap[suiteId] = {};
    }

    var fullName = spec.getFullName();
    var desc = spec.description;
    var resultItems = results.getItems();
    var resultData = [];
    if(!passed){
      for(var i=0;i<resultItems.length;i++){
        var result = resultItems[i];
        resultData.push(convertResultData(result));
      }
    }

    suitesMap[suiteId][spec.id] = {
      fullName: fullName,
      desc: desc,
      passed: passed,
      resultData: resultData
    }
  };

  function convertResultData(result){
    if(result.type == 'expect' && result.passed && !result.passed()){
      var ret = {};
      ret.type = result.type;
      ret.passed = false;
      ret.message = result.message;
      if(result.trace && result.trace.stack){
        ret.stackTrace = result.trace.stack;
      }
    }
    return ret;
  }

  function getSuiteParents(suite){
    var parents = [];
    if(suite.parentSuite){
      for(var parentSuite = suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite){
        parents.push(parentSuite.id);
      }
    }
    return parents;
  }
}
