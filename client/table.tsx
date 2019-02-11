/// <reference path="../node_modules/@types/react/index.d.ts" />
/// <reference types="react" />
declare var findJsParent: () => any;
declare var google: any;
(function (context) {
    let bindAllTheThings = function (this: React.Component<any, any>, prototype: object) {
        Object.getOwnPropertyNames(prototype).filter(x => x != "constructor").map(x => {
            if (typeof ((this as any)[x]) === "function") {
                (this as any)[x] = (this as any)[x].bind(this);
            }
        });
    }
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
            if (data.history.length == 0) {
                new google.maps.Marker({ position: { lat: 37.774900, lng: -122.419400 }, map: map, title: 'San Francisco' });
                new google.maps.Marker({ position: { lat: 30.251183, lng: -81.590179 }, map: map, title: 'Xpress' });
                new google.maps.Marker({ position: { lat: 30.32389185, lng: -81.3956847 }, map: map, title: 'SourceFuse' });

            }
            data.history
                .map(x => {
                    new google.maps.Marker({ position: { lat: x.start_city.latitude, lng: x.start_city.longitude }, map: map, title: x.start_city.display_name })

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
    const HistoryTable = ({ data }: { data: HistoryData | undefined }) => {
        if (data == null || data.history == null)
            return <div>No history found!</div>;
        else if(!data.history.length || data.history.length == 0){
            return <div>History found, but was empty</div>
        }
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
                            data.history.sort((a,b) => a.start_time < b.start_time ? 1 : -1).map(hi =>
                                <tr key={hi.request_id}>
                                    <td>{new Date(hi.start_time * 1000).toLocaleDateString()}</td>
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
    const ProfileDisplay = ({ me }: { me: UberProfile | undefined }) => {
        console.log('me', me)
        if (me == null) return <div />
        return (<div>
            {me.last_name}, {me.first_name}
        </div>)
    }
    interface TableDisplayState {
        data: HistoryData | undefined
        ajaxing: boolean
        lastRefresh: Date | undefined
    }
    interface TableDisplayProps {
        me: UberProfile | undefined
        data: HistoryData | undefined
    }
    class TableDisplay extends React.Component<TableDisplayProps, TableDisplayState> {
        constructor(props: TableDisplayProps) {
            super(props);
            bindAllTheThings.call(this, TableDisplay.prototype);
            this.state = this.getDefaultState();
        }
        getDefaultState(): TableDisplayState {
            return { data: this.props.data, ajaxing: false, lastRefresh: undefined }
        }
        renderRefresh(data: HistoryData) {
            console.log('refresh loading', data)
            this.setState({ data: data, ajaxing: false, lastRefresh: new Date() })
        }
        refresh() {
            console.log('refreshing')
            this.setState({ ajaxing: true })
        }
        componentWillMount() {
            console.log('did mount')
        }
        render() {
            console.log("rendering")
            if (this.state.ajaxing) {
                console.log('fetching!', context.historyUrl)
                context.fetch(context.historyUrl)
                    .then((response: any) => {
                        console.log('resp', response);
                        try {

                            var json = response.json()
                            console.log('json?',json)
                            return json
                        }
                        catch(c){
                            console.error(c)
                            return response.text()}
                    })
                    .then(this.renderRefresh)
            }
            var middleWhere: JSX.Element | undefined;
            if (!this.state.ajaxing && context.historyUrl != null)
                middleWhere = (<button title={this.state.lastRefresh != null ? this.state.lastRefresh.toLocaleTimeString() : 'Not refreshed'} onClick={this.refresh.bind(this)}>Refresh</button>)
            else if (context.historyUrl != null && this.state.ajaxing)
                middleWhere = <button disabled={true}>Refresh</button>
            else <div>History refresh unavailable</div>
            console.log('done creating where')
            return (
                <div>
                    <ProfileDisplay me={this.props.me} />
                    {middleWhere}
                    <HistoryTable data={this.state.data} />
                </div>
            )
        }
    }

    ReactDOM.render(
        // <HistoryTable data={context.data} />,
        <TableDisplay data={context.data} me={context.me} />,
        document.getElementById('body')
    )
})(findJsParent())