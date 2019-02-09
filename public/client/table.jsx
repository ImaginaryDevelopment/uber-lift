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
                return <tr key={hi.request_id}>
                                    <td>{new Date(hi.start_time).toLocaleDateString()}</td>
                                    <td>{hi.start_city.display_name}</td>
                                </tr>;
            })}
                    </tbody>
                </table>

            </div>);
        }
    };
    var ProfileDisplay = function (_a) {
        var me = _a.me;
        console.log('me', me);
        if (me == null)
            return <div />;
        return (<div>
            {me.last_name}, {me.first_name}
        </div>);
    };
    var TableDisplay = function (_a) {
        var me = _a.me, data = _a.data;
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        console.log('tableDisplay', me, data, rest);
        return (<div>
                <ProfileDisplay me={me}/>
                <HistoryTable data={data}/>
            </div>);
    };
    ReactDOM.render(
    // <HistoryTable data={context.data} />,
    <TableDisplay data={context.data} me={context.me}/>, document.getElementById('body'));
})(findJsParent());
