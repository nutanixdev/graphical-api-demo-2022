@extends( 'layouts.fullscreen' )

@section( 'content' )

    <div class="row">
        @include( 'partials._credentialsPanel' )
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading"><h2 class="step-heading">Step 2</h2>
                    <div class="step-desc">Select a demo</div>
                </div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-12">
                            <form id="select-demo">
                                <select class="form-control" name="select_demo" id="select_demo">
                                    <option value="demo-read">Get cluster details</option>
                                    <option value="demo-container">Create container</option>
                                    <option value="demo-shell">Create shell VM</option>
                                    <option value="demo-deploy">Deploy full VM w/ Cloud-Init</option>
                                </select>
                            </form>
                            @include( 'partials._demoRead' )
                            @include( 'partials._demoContainer' )
                            @include( 'partials._demoShell' )
                            @include( 'partials._demoDeploy' )
                        </div>
                    </div>
                    <button class="btn btn-primary" name="run-demo" id="run-demo">Run Demo</button>
                    <div id="demo-messages">&nbsp;</div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading"><h2 class="step-heading">Step 3</h2>
                    <div class="step-desc">Check out the results ...</div>
                </div>
                <div class="panel-body">
                    <div id="result-messages">&nbsp;</div>
                    @include( 'partials._read' )
                </div>
            </div>
        </div>
    </div>

@endsection