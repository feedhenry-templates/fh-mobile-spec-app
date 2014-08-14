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

  function sendReport(testData){
    reportsCache.push(testData);
    if(reportsCache.length === limit){
      var dataToSend = reportsCache.splice(0, limit);
      var reqData = {};
      reqData.reporterId = reporterId;
      reqData.deviceInfo = window.device || {};
      reqData.testInfo = dataToSend;
      fh.cloud({
        path: '/recordTest',
        type: 'POST',
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
    sendReport({
      stage: 'runner_starting',
      data: {
        'total_specs': specs.length
      }
    });
  };

  self.reportRunnerResults = function(runner){
    sendReport({
      stage: 'complete'
    });
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
        passed: passed,
        totalCount: totalCount,
        passedCount: passedCount,
        failedCount: failedCount,
        skipped : skipped
      }
    });
  };

  self.reportSpecStarting = function(spec){
    sendReport({
      stage: 'spec_start',
      data: {
        suiteDesc: spec.suite.description,
        specDesc: spec.description
      }
    });
  };

  self.reportSpecResults = function(spec){
    var fullName = spec.getFullName();
    var desc = spec.description;
    var results = spec.results();
    var passed = results.passed();
    var skipped = results.skipped;
    var resultItems = results.getItems();
    var resultData = [];
    for(var i=0;i<resultItems.length;i++){
      var result = resultItems[i];
      resultData.push(convertResultData(result));
    }
    sendReport({
      stage: 'spec_complete',
      data: {
        fullName: fullName,
        desc: desc,
        passed: passed,
        skipped: skipped,
        results: resultData
      }
    });
  };

  function convertResultData(result){
    var ret = {};
    ret.type = result.type;
    ret.passed = result.passed;
    ret.passedFunc = result.passed();
    ret.message = result.message;
    if(result.trace && result.trace.stack){
      ret.stackTrace = result.trace.stack;
    }
    return ret;
  }
}