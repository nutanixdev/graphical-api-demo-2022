function cvmAddressEntered( inputElement )
{
    return ( $( inputElement ).val() != '' );
}

$( document ).ready( function ()
{

    $( 'div.alert-success' ).delay( 3000 ).slideUp( 300 );
    $( 'div.alert-info' ).delay( 3000 ).slideUp( 300 );

    var now = new Date();
    const CURRENT_DATE = now.getFullYear() + '-' + ( now.getMonth() > 9 ? now.getMonth() : '0' + now.getMonth() ) + '-' + now.getDate();
    const OBJECT_PREFIX = 'DEMO-' + CURRENT_DATE + '-';

    $( document ).on( 'click', '.populate_container', function ( e )
    {
        $( '#deploy-container' ).val( $( this ).html() );
        e.preventDefault();
    } );

    $( document ).on( 'click', '.populate_vdisk', function ( e )
    {
        $( '#deploy-disk-uuid' ).val( $( this ).html() );
        e.preventDefault();
    } );

    $( document ).on( 'click', '.populate_network', function ( e )
    {
        $( '#deploy-net-uuid' ).val( $( this ).html() );
        e.preventDefault();
    } );

    $( '#server-profile' ).on( 'change', function ( e )
    {

        var profiles = [ 'exch', 'dc', 'lamp' ];

        $.each( profiles, function ( key, field )
        {
            if ( $( '#server-profile' ).val() == field ) {
                $( '#profile-' + field + '-spec' ).fadeIn( 300 );
            }
            else {
                $( '#profile-' + field + '-spec' ).hide();
            }
        } );

        e.preventDefault();
    } );

    $( '#set-contrast' ).on( 'click', function ( e )
    {
        if ( $( 'body' ).hasClass( 'opacity-normal' ) ) {
            $( 'body' ).removeClass( 'opacity-normal' );
            $( 'body' ).addClass( 'opacity-high' );
            $( 'div.panel > *' ).css( 'color', '#000' );
        }
        else {
            $( 'body' ).removeClass( 'opacity-high' );
            $( 'body' ).addClass( 'opacity-normal' );
            $( 'div.panel > *' ).css( 'color', '#7e7e82' );
        }
        e.preventDefault();
    } );

    $( '#select_demo' ).on( 'change', function ( e )
    {
        var demos = [ 'demo-read', 'demo-read-v3', 'demo-container', 'demo-shell', 'demo-deploy', 'demo-raw' ];
        $.each( demos, function ( key, field )
        {
            if ( $( '#select_demo' ).val() == field ) {
                $( '#' + field ).fadeIn( 300 );
            }
            else {
                $( '#' + field ).hide();
            }
        } );
        $( '#result-messages' ).html( '' );
        e.preventDefault();
    } );

    $( '#run-demo' ).on( 'click', function ( e )
    {
        var demo = $( '#select_demo' ).val();

        if ( !cvmAddressEntered( '#cvm-address' ) || !cvmAddressEntered( '#cvm-port' ) || !cvmAddressEntered( '#cluster-username' ) || !cvmAddressEntered( '#cluster-password' ) || !cvmAddressEntered( '#cluster-timeout' ) ) {
            $( '#demo-messages' ).html( 'Please complete all fields, then try again.' ).addClass( 'bad' );
        }
        else {

            var token = $( '#_token' ).val();

            switch ( demo ) {
                case "demo-read":

                    $( '#apiOutput' ).hide();

                    $( '#result-messages' ).html( 'Submitting API GET request ... please be patient.' ).removeClass( 'bad' ).addClass( 'good' );

                    var cvm_address = $( '#cvm-address' ).val();
                    var cluster_username = $( '#cluster-username' ).val();
                    var cluster_password = $( '#cluster-password' ).val();
                    var cluster_timeout = $( '#cluster-timeout' ).val();
                    var cluster_port = $( '#cvm-port' ).val();
					var token = $('#_token').val();

                    /* Submit the request via AJAX */
                    request = $.ajax( {
                        // url: "../ajax/ajaxReadCluster.php",
                        url: "/ajax/read-demo",
                        method: "post",
                        dataType: "json",
                        data: {
                            "cvm-address": cvm_address,
                            "cluster-username": cluster_username,
                            "cluster-password": cluster_password,
                            "cluster-timeout": cluster_timeout,
                            "cluster-port": cluster_port,
                            "_token": token
                        }
                    } ).done( function ( data )
                    {
                        if ( data.result == 'ok' ) {

                            $( '#result-messages' ).html( '' );

                            var dataFields = {
                                id: {id: 'cluster-id'},
                                name: {id: 'cluster-name'},
                                timezone: {id: 'cluster-timezone'},
                                nodes: {id: 'cluster-numNodes'},
                                sc: {id: 'cluster-enableShadowClones'},
                                sn: {id: 'cluster-blockZeroSn'},
                                ip: {id: 'cluster-IP'},
                                nos: {id: 'cluster-nosVersion'},
                                sed: {id: 'cluster-hasSED'}
                            };

                            $.each( dataFields, function ( key, field )
                            {
                                $( 'span#' + field.id ).html( data[ field.id ] );
                            } );

                            $( '#ssd_graph' ).html( '<img src="../ajax/charts/' + data.ssdGraph + '">' );
                            $( '#hdd_graph' ).html( '<img src="../ajax/charts/' + data.hddGraph + '">' );

                            $( 'span#hypervisors' ).html( '' );
                            $( data.hypervisorTypes ).each( function ( index, item )
                            {
                                switch ( item ) {
                                    case 'kKvm':
                                        $( 'span#hypervisors' ).append( 'AHV ' );
                                        break;
                                    case 'kVMware':
                                        $( 'span#hypervisors' ).append( 'ESXi ' );
                                        break;
                                    case 'kHyperv':
                                        $( 'span#hypervisors' ).append( 'Hyper-V ' );
                                        break;
                                }
                            } );

                            $( 'table#containers' ).html( '' ).html( '<thead><tr><td>Name</td><td>RF</td><td>Compression</td><td>Comp. Delay (Minutes)</td><td>RAM/SSD Dedupe?</td><td>HDD Dedupe?</td></tr></thead>' );
                            $( data.containers ).each( function ( index, item )
                            {
                                $( 'table#containers tr:first' ).after(
                                    '<tr><td>' + item.name + '</td>'
                                    + '<td>' + item.replicationFactor + '</td>'
                                    + ( item.compressionEnabled ? ( '<td>Yes</td><td>' + ( item.compressionDelay / 60 ) + '</td>' ) : ( '<td>No</td><td>-</td>' ) )
                                    + '<td>' + ( item.fingerprintOnWrite ? 'Yes' : 'No' ) + '</td>'
                                    + '<td>' + ( item.onDiskDedup ? 'Yes' : 'No' ) + '</td>'
                                    + '</tr>'
                                );
                            } );

                            $( '#clusterDetails' ).show();
                        }
                        else {
                            $( '#clusterDetails' ).hide();
                            $( '#apiOutput' ).hide();$()
                            $( '#result-messages' ).html( data.message ).removeClass( 'good' ).addClass( 'bad' );
                        }
                    } );

                    request.done( function ( response, textStatus, jqXHR )
                    {
                        $( '#demo-messages' ).html( 'Request completed.  To see the results, scroll down to Step 3.' ).removeClass( 'good' ).removeClass( 'bad' );
                    } );

                    request.fail( function ( jqXHR, textStatus, errorThrown )
                    {
                        /* Display an error message */
                        // $( '#result-messages' ).html( 'Unfortunately an error occurred while processing the request.  Status: ' + textStatus + ', Error Thrown: ' + errorThrown ).removeClass( 'good' ).addClass( 'bad' );
                        $( '#result-messages' ).html( request.responseText );
                    } );
                    break;
                case "demo-container":
                    $( function ()
                    {
                        $( "#dialog-confirm" ).dialog( {
                            resizable: false,
                            height: 240,
                            width: 420,
                            modal: true,
                            buttons: {
                                "Yes, do it!": function ()
                                {

                                    $( '#clusterDetails' ).hide();
                                    $( '#apiOutput' ).hide();

                                    $( this ).dialog( "close" );
                                    if ( $( '#container-name' ).val() != '' ) {
                                        /* A container name was entered - we can carry on */

                                        $( '#result-messages' ).html( 'Submitting create container request ... please be patient.' ).removeClass( 'bad' ).addClass( 'good' );

                                        var cvm_address = $( '#cvm-address' ).val();
                                        var cluster_username = $( '#cluster-username' ).val();
                                        var cluster_password = $( '#cluster-password' ).val();
                                        var cluster_timeout = $( '#cluster-timeout' ).val();
                                        var cluster_port = $( '#cvm-port' ).val();
                                        var container_name = OBJECT_PREFIX + $( '#container-name' ).val();
										var token = $('#_token').val();

										/* Submit the request via AJAX */
										request = $.ajax({
                                            url: "/ajax/demo-container",
                                            method: "post",
                                            dataType: "json",
                                            data: {
                                                "cvm-address": cvm_address,
                                                "cluster-username": cluster_username,
                                                "cluster-password": cluster_password,
                                                "container-name": container_name,
                                                "cluster-timeout": cluster_timeout,
                                                "cluster-port": cluster_port,
                                                "_token": token
                                            }
                                        }).done(function(data){
											$('#demo-messages').html('Request completed.  Scroll down to see the results.').removeClass('good').removeClass('bad');
											if( data.result == "failed" ) {
												if( data.message != "" ) {
													$('#result-messages').html(data.message).removeClass('good').addClass('bad');
												}
											}
											else {
												if( data.result == "ok" ) {
													$('#result-messages').html(data.message).removeClass('bad').addClass('good');
												}
											}
										}).fail(function(data){
											$('#result-messages').html(request.responseText);
										});
                                    }
                                    else {
                                        /* Container name is missing */
                                        $( '#result-messages' ).html( 'Please enter a container name, then try again.' ).removeClass( 'good' ).addClass( 'bad' );
                                    }
                                },
                                "Nope, I'm bailing out!": function ()
                                {
                                    $( this ).dialog( "close" );
                                }
                            }
                        } );
                    } );
                    break;
                case "demo-shell":
                    $( function ()
                    {
                        $( "#dialog-confirm" ).dialog( {
                            resizable: false,
                            height: 240,
                            width: 420,
                            modal: true,
                            buttons: {
                                "Yes, do it!": function ()
                                {

                                    $( '#clusterDetails' ).hide();
                                    $( '#apiOutput' ).hide();

                                    $( this ).dialog( "close" );
                                    if ( $( '#server-name' ).val() != '' ) {
                                        /* A VM name was entered - we can carry on */

                                        $( '#result-messages' ).html( 'Submitting create shell VM request ... please be patient.' ).removeClass( 'bad' ).addClass( 'good' );

                                        var cvm_address = $( '#cvm-address' ).val();
                                        var cluster_username = $( '#cluster-username' ).val();
                                        var cluster_password = $( '#cluster-password' ).val();
                                        var cluster_timeout = $( '#cluster-timeout' ).val();
                                        var cluster_port = $( '#cvm-port' ).val();
                                        var server_profile = $( '#server-profile' ).val();
                                        var server_name = OBJECT_PREFIX + $( '#server-name' ).val();
										var token = $('#_token').val();

                                        /* Submit the request via AJAX */
                                        request = $.ajax( {
                                            url: "/ajax/shell-vm",
                                            method: "post",
                                            dataType: "json",
                                            data: {
                                                "cvm-address": cvm_address,
                                                "cluster-username": cluster_username,
                                                "cluster-password": cluster_password,
                                                "cluster-timeout": cluster_timeout,
                                                "cluster-port": cluster_port,
                                                "server-name": server_name,
                                                "server-profile": server_profile,
                                                "_token": token
                                            }
                                        } ).done(function(data) {
											$('#demo-messages').html('Request completed.  Scroll down to see the results.').removeClass('good').removeClass('bad');
											if( data.result == "failed" ) {
												if( data.message != "" ) {
													$('#result-messages').html(data.message).removeClass('good').addClass('bad');
												}
											}
											else {
												if( data.result == "ok" ) {
													$('#result-messages').html(data.message).removeClass('bad').addClass('good');
												}
											}
										}).fail(function(data){
											$('#result-messages').html(request.responseText);
										});
                                    }
                                    else {
                                        /* VM name is missing */
                                        $( '#result-messages' ).html( 'Please specify a VM name, then try again.' ).removeClass( 'good' ).addClass( 'bad' );
                                    }
                                },
                                "Nope, I'm bailing out!": function ()
                                {
                                    $( this ).dialog( "close" );
                                }
                            }
                        } );
                    } );
                    break;
                case "demo-deploy":
                    $( function ()
                    {
                        $( "#dialog-confirm" ).dialog( {
                            resizable: false,
                            height: 240,
                            width: 420,
                            modal: true,
                            buttons: {
                                "Yes, do it!": function ()
                                {

                                    $( '#clusterDetails' ).hide();
                                    $( '#apiOutput' ).hide();

                                    $( this ).dialog( "close" );
                                    if ( ( $( '#server-name-custom' ).val() != '' ) && ( $( '#deploy-container' ).val() != '' ) && ( $( '#deploy-net-uuid' ).val() != '' ) && ( $( '#deploy-disk-uuid' ).val() != '' ) ) {
                                        /* A VM name was entered - we can carry on */

                                        $( '#result-messages' ).html( 'Submitting \'VM create with customize\' request ... please be patient.' ).removeClass( 'bad' ).addClass( 'good' );

                                        var cvm_address = $( '#cvm-address' ).val();
                                        var cluster_username = $( '#cluster-username' ).val();
                                        var cluster_password = $( '#cluster-password' ).val();
                                        var cluster_timeout = $( '#cluster-timeout' ).val();
                                        var cluster_port = $( '#cvm-port' ).val();
                                        var server_name = OBJECT_PREFIX + $( '#server-name-custom' ).val();
                                        var server_profile = $( '#server-profile-custom' ).val();
                                        var disk_uuid = $( '#deploy-disk-uuid' ).val();
                                        var net_uuid = $( '#deploy-net-uuid' ).val();
                                        var container_name = $( '#deploy-container' ).val();
                                        var token = $('#_token').val();

                                        /* Submit the request via AJAX */
                                        request = $.ajax( {
                                            url: "/ajax/cloud-init-vm",
                                            method: "post",
                                            dataType: "json",
                                            data: {
                                                "cvm-address": cvm_address,
                                                "cluster-username": cluster_username,
                                                "cluster-password": cluster_password,
                                                "cluster-timeout": cluster_timeout,
                                                "cluster-port": cluster_port,
                                                "server-name-custom": server_name,
                                                "server-profile-custom": server_profile,
                                                "container-name": container_name,
                                                "disk-uuid": disk_uuid,
                                                "net-uuid": net_uuid,
                                                "_token": token
                                            }
                                        } ).done(function(data) {
											if ( data.result == 'ok' ) {
                                                $( '#result-messages' ).html( 'VM deployment request submitted successfully!' ).removeClass( 'bad' ).addClass( 'good' );
                                            }
                                            else {
                                                $( '#result-messages' ).html( data.message ).removeClass( 'good' ).addClass( 'bad' );
                                            }
										}).fail(function(data) {
											/* Display an error message */
                                            $( '#result-messages' ).html( request.responseText );
										});
                                    }
                                    else {
                                        /* VM name are missing */
                                        $( '#result-messages' ).html( 'Please complete all fields, then try again.' ).removeClass( 'good' ).addClass( 'bad' );
                                    }
                                },
                                "Nope, I'm bailing out!": function ()
                                {
                                    $( this ).dialog( "close" );
                                }
                            }
                        } );
                    } );
                    break;
            }
        }

        e.preventDefault();
    } );

    $( '#deploy-expand' ).on( 'click', function ( e )
    {
        $( '#deploy-details' ).toggle( 300 );
        e.preventDefault();
    } );

    $( '#deploy-get-details' ).on( 'click', function ( e )
    {

        if ( cvmAddressEntered( '#cvm-address' ) && cvmAddressEntered( 'cvm-port' ) && cvmAddressEntered( '#cluster-username' ) && cvmAddressEntered( '#cluster-password' ) && cvmAddressEntered( '#cluster-timeout' ) ) {

            var cvm_address = $( '#cvm-address' ).val();
            var cluster_username = $( '#cluster-username' ).val();
            var cluster_password = $( '#cluster-password' ).val();
            var cluster_timeout = $( '#cluster-timeout' ).val();
            var cluster_port = $( '#cvm-port' ).val();
            var token = $('#_token').val();

            /* Submit the request via AJAX */
            request = $.ajax( {
                url: "/ajax/load-cluster-details",
                method: "post",
                dataType: "json",
                data: {
                    "cvm-address": cvm_address,
                    "cluster-username": cluster_username,
                    "cluster-password": cluster_password,
                    "cluster-timeout": cluster_timeout,
                    "cluster-port": cluster_port,
                    "_token": token
                }
            } ).done(function(data) {
				if ( data.result == 'ok' ) {

                    var container_info = '<table class="table"><tr><td class="deploy-details-header">Containers</td></tr>';

                    $.each( data.containers, function ( key, field )
                    {
                        container_info = container_info + '<tr><td><span class="populate_container" style="cursor: hand;">' + field.name + '</span></td></tr>';
                    } );

                    container_info = container_info + '</table>';

                    var network_info = '<table class="table"><tr><td colspan="2" class="deploy-details-header">Networks</td></tr><tr><td>Name &amp; ID</td><td>vLAN UUID</td></tr>';

                    $.each( data.networks, function ( key, field )
                    {
                        network_info = network_info + '<tr><td>' + field.name + ' (vLAN ' + field.vlanId + ')</td><td><span class="populate_network">' + field.vlanUuid + '</span></td></tr>';
                    } );

                    network_info = network_info + '</table>';

                    var vdisk_info = '<table class="table"><tr><td colspan="2" class="deploy-details-header">Virtual Disks</td></tr><tr><td>VM Name</td><td>vDisk UUID</td></tr>';

                    $.each( data.virtual_disks, function ( key, field )
                    {
                        vdisk_info = vdisk_info + '<tr><td>' + field.vm_name + '</td><td><span class="populate_vdisk">' + field.uuid + '</span></td></tr>';
                    } );

                    vdisk_info = vdisk_info + '</table>';

                    $( '#deploy-details-results' ).html( container_info + network_info + vdisk_info );
                    $( '#deploy-details-messages' ).html( '' );

                }
                else {
                    // $( '#deploy-details-messages' ).html( 'Please check your cluster details, then try again.' ).removeClass( 'good' ).addClass( 'bad' );
                    $( '#deploy-details-messages' ).html( data.message ).removeClass( 'good' ).addClass( 'bad' );
                }
			}).fail(function(data) {
				$( '#result-messages' ).html( request.responseText );
			});
        }
        else {
            $( '#deploy-details-messages' ).html( 'Please provide all required credentials, then try again.' ).removeClass( 'good' ).addClass( 'bad' );
        }

        e.preventDefault();
    } );

    $( 'body' ).addClass( 'opacity-normal' );

    /* load the container list */


} );
