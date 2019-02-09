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
type Uri = string
interface Profile {
    picture: Uri
    first_name: string
    last_name: string
    promo_code: string
    rider_id: string
    email: string
    mobile_verified: boolean
    uuid: string
}

(function (context) {
    const HistoryTable = ({ data }: { data: HistoryData }) => {
        console.log(context)
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
                        {
                            data.history.map(hi =>
                                <tr key={hi.request_id}>
                                    <td>{new Date(hi.start_time).toLocaleDateString()}</td>
                                    <td>{hi.start_city.display_name}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>

            </div>);
        }
    }
    const ProfileDisplay = ({ me }: { me: Profile }) => {
        console.log('me', me)
        if (me == null) return <div />
        return (<div>
            {me.last_name}, {me.first_name}
        </div>)
    }
    const TableDisplay = ({ me, data }: { me: Profile, data: HistoryData },...rest : any[]) => {
        console.log('tableDisplay',me,data,rest)
        return (
            <div>
                <ProfileDisplay me={me} />
                <HistoryTable data={data} />
            </div>
        )
    }

    ReactDOM.render(
        // <HistoryTable data={context.data} />,
        <TableDisplay data={context.data} me={context.me} />,
        document.getElementById('body')
    )
})(findJsParent())