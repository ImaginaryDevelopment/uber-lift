"use strict";
/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
(function (context) {
    var HistoryTable = function (_a) {
        var data = _a.data;
        console.log(context);
        if (context.body == null)
            return <div>Hello React!</div>;
        else {
            return (<div>
                <table className="table is-bordered is-striped">
                    <thead>
                        <tr>
                            <th>Start</th>
                            <th>Display</th>
                        </tr>
                    </thead>
                    <tbody>

                        {data.history.map(function (hi) {
                return <tr>
                                    <td>{new Date(hi.start_time).toLocaleDateString()}</td>
                                    <td>{hi.start_city.display_name}</td>
                                </tr>;
            })}
                    </tbody>
                </table>

            </div>);
        }
    };
    ReactDOM.render(<HistoryTable data={context.data}/>, document.getElementById('body'));
})(findJsParent());
