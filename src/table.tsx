/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
declare var findJsParent: () => any;

(function (context) {
    const HistoryTable = () => {
        console.log(context)
        if (context.body == null)
            return <div>Hello React!</div>;
        else return <div>Hello body</div>;

    }

    ReactDOM.render(
        <HistoryTable />, document.getElementById('body')
    )
})(findJsParent())