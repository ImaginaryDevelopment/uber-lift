"use strict";
(function (context) {
    var HistoryTable = function () {
        console.log(context);
        if (context.body == null)
            return <div>Hello React!</div>;
        else
            return <div>Hello body</div>;
    };
    ReactDOM.render(<HistoryTable />, document.getElementById('body'));
})(findJsParent());
