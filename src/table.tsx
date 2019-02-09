/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
declare var findJsParent: () => any;
interface HistoryCity {
    latitude: number
    display_name: string
    longitude: number
}
interface HistoryItem {
    status: string
    distance: number
    product_id: string
    start_time: number
    start_city: HistoryCity
    end_time: number
    request_id: string
    request_time: number
}
interface HistoryData {
    count: number
    limit: number
    offset: number
    history: HistoryItem[]
}

(function (context) {
    const HistoryTable = ({ data }: { data: HistoryData }) => {
        console.log(context)
        if (context.body == null)
            return <div>Hello React!</div>;
        else {
            return <div>
                <table>
                    <thead>
                        <tr>
                            <th>Start</th>
                            <th>Display</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            data.history.map(hi =>
                                <tr>
                                    <td>{new Date(hi.start_time).toLocaleDateString()}</td>
                                    <td>{hi.start_city.display_name}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>

            </div>;
        }
    }

    ReactDOM.render(
        <HistoryTable data={context.data} />, document.getElementById('body')
    )
})(findJsParent())