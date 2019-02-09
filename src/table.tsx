/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
declare var findJsParent: () => any;
declare var google: any;
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
    context.appendedMap = false;
    const Marker = ({ data }: { data: HistoryData }) => {
        if (data == null || data.history == null)
            return <div>No history found!</div>;
        context.initMap = () => {
            console.log("map initializing")
            var center = { lat: 30.251183, lng: -81.590179 };
            var mapElement = document.getElementById('map')
            var map = new google.maps.Map(mapElement, {
                zoom: 4,
                center: center,
                // styles: [] // https://developers.google.com/maps/documentation/javascript/styling
            });
            if(data.history.length == 0){
                new google.maps.Marker({ position: { lat: 37.774900, lng: -122.419400 }, map: map, title: 'San Francisco' });
                new google.maps.Marker({ position: { lat: 30.251183, lng: -81.590179 }, map: map, title: 'Xpress' });
                new google.maps.Marker({position:{lat:30.32389185,lng:-81.3956847}, map:map, title: 'SourceFuse'});

            }
            data.history
                .map(x =>{
                new google.maps.Marker({position:{lat:x.start_city.latitude,lng:x.start_city.longitude},map:map,title:x.start_city.display_name})

            })
        }
        if (!context.appendedMap) {
            const script = document.createElement("script")
            script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDV3nmdg4uqjEstQI4v_tXaEXg0AdNwzfY&callback=initMap";
            script.defer = true;
            script.async = true;
            document.body.appendChild(script)
        }
        return (
            <div data-rendered="map">
            </div>
        )
    }
    const HistoryTable = ({ data }: { data: HistoryData }) => {
        if (data == null || data.history == null)
            return <div>No history found!</div>;
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
                <Marker data={data} />
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
    const TableDisplay = ({ me, data }: { me: Profile, data: HistoryData }, ...rest: any[]) => {
        console.log('tableDisplay', me, data, rest)
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