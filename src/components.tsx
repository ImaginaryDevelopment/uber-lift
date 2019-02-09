interface AjaxProps<T>{
    title:string
    getUrl:string
    renderData (data:T): JSX.Element
}
interface App extends Extensions{
    IsAjaxWrapperDebug:boolean
    Ajax: <T extends {}>(props:AjaxProps<T>) => JSX.Element
}
(function(exports:App){
    exports.IsAjaxWrapperDebug = false;
    const debugAjaxWrapper:((x:string,...items:any[]) => void) = function(){
        if (exports.IsAjaxWrapperDebug) {
            console.log(arguments);
        }
    };
    interface AjaxWrapperState<T> {
        data?:T,
        searchError?:string|null,
        loading:boolean,
        urlChanged:boolean
    }
    // interface PaneState{ }
    interface AjaxWrapperProps<T> {
        getUrl:string,
        render(state:AjaxWrapperState<T>):JSX.Element
    }

    // assumes the search/get starts immediately
    class AjaxWrapper<T> extends React.Component<AjaxWrapperProps<T>,AjaxWrapperState<T>> {
        constructor(props:AjaxWrapperProps<T>){
            super(props);
            let state:AjaxWrapperState<T> = {data:undefined, searchError:null,loading:true, urlChanged:false};
            this.state = state;
        }
        componentWillMount(){ // this means it only happens the once, not when the url changes
            debugAjaxWrapper('AjaxWrapper: componentWillMount');
            this.sendSearch(this.props.getUrl);
            debugAjaxWrapper('AjaxWrapper: sendSearch completed');
        }
        componentWillReceiveProps(nextProps:AjaxWrapperProps<T>){
            debugAjaxWrapper('AjaxWrapper: componentWillReceiveProps');
            if(this.props.getUrl != nextProps.getUrl){
                console.log('getUrl changed to ' + nextProps.getUrl);
            this.setState({data:undefined, searchError:null,loading:true, urlChanged:true},() => {
                this.sendSearch(nextProps.getUrl);
            });
            }
        }
        onSearchFailed(searchText:string){
            debugAjaxWrapper('AjaxWrapper: onSearchFailed');
            console.warn('ajax failed');
            this.setState({data:undefined,searchError:'failed to search for ' + searchText,loading:false});
        }
        // Event does not have a responseText property on the target property and EventTarget cannot be cast as XMLHttpRequestEventTarget
        // is evt really an Event?
        onSearchResults(evt:Event) {
            console.log('onSearchResults');
            (exports as any).evt = evt;
            let t: XMLHttpRequest = evt.target as any;
            let model = JSON.parse(t.responseText);
            debugAjaxWrapper('AjaxWrapper: onSearchResults',model, evt);
            (exports as any).target = evt.target;
            (exports as any).searchResults = model;
            this.setState({data:model, loading:false});
        }
        sendSearch(url:Uri){
            //fetch
            console.log('sendSearch', url);
            debugAjaxWrapper('AjaxWrapper :about to fetch',this.props,this.state);
            this.setState({data:undefined, searchError:null,loading:true,urlChanged:false});
            console.log('cleared state');

            let oReq = new XMLHttpRequest();
            oReq.addEventListener("load", this.onSearchResults.bind(this));
            oReq.addEventListener("error", this.onSearchFailed.bind(this) as any);
            oReq.open("GET", url);
            oReq.send();
        }
        render(){
            let props = this.props;
            let state = this.state;
            debugAjaxWrapper('AjaxWrapper: rendering', state);
            let rendering = props.render(state);
            debugAjaxWrapper('AjaxWrapper: rendering completed', rendering);
            return (rendering? rendering : (<div>ajax wrapper failed to render</div>));
        }
    }
    (AjaxWrapper as any).displayName = 'AjaxWrapper';

    interface AjaxRendererProps<T>{
        data:T
        searchError?:string
        loading:boolean
        title:string
        renderData (data:T): JSX.Element
    }

    // render the final results
    const AjaxRenderer = <T extends {}> (props:AjaxRendererProps<T>) : JSX.Element => {
        try{
            (exports as any).ajaxRendererProps = props;
            if(exports.isDefined(props.searchError) || (props.loading !== true && !exports.isDefined(props.data))){
                debugAjaxWrapper("AjaxRenderer.Branch1", props);
                return (<div className="text-danger">{props.title} load failed</div>);
            } else if (props.loading === true){
                debugAjaxWrapper("AjaxRenderer.Branch2", props);
                return (<div className="text-warning">Loading {props.title}...</div>);
            } else {
                debugAjaxWrapper("AjaxRenderer.Branch3", props);
                let result = props.renderData(props!.data);
                if(result == null){
                    console.error('renderer returned an invalid value', result, props.title);
                    return (<div>Error for {props.title}</div>);
                }
                return result;
            }
        }
        catch(ex){
            console.error('ajax renderer exception', ex);
            return (<div/>);

        }
    };
    (AjaxRenderer as any).displayName = 'AjaxRenderer';

    // curry the renderer through the wait wrapper this is the only exported component
    const Ajax = <T extends {}> (props:AjaxProps<T>) => {
        let renderGiftWrapping = (state:AjaxWrapperState<any>) => {
            debugAjaxWrapper("Ajax.renderGiftWrapping", state);
            let result = (<AjaxRenderer
                title={props.title}
                loading={state.loading}
                data={state!.data}
                renderData={props.renderData} />);
            debugAjaxWrapper("Ajax.result", result);
            return result;
            };
        console.log('Ajax', props.getUrl);
        return (<AjaxWrapper getUrl={props.getUrl} render={renderGiftWrapping} />);
    };
    (Ajax as any).displayName = 'Ajax';
    exports.Ajax = Ajax;
})(findJsParent())
