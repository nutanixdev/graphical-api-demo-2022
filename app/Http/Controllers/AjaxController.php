<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AjaxController extends Controller
{

    var $post_data = array();
    var $guzzle_options = array();

    /**
     * class constructor
     * sets up our default GuzzleHttp options and collects initial POSt info from the user form
     */
    public function __construct()
    {
        $this->post_data['username'] = $_POST['cluster-username'];
        $this->post_data['password'] = $_POST['cluster-password'];
        $this->post_data['cvm'] = $_POST['cvm-address'];
        $this->post_data['port'] = $_POST['cluster-port'];
        $this->post_data['timeout'] = $_POST['cluster-timeout'];

        $this->guzzle_options = [
            'auth' => [
                $this->post_data['username'],
                $this->post_data['password']
            ],
            'verify' => false,
            'headers' => [
                'Content-Type' => 'application/json'
            ],
            'config' => [
                'cookies' => true,
                'connect_timeout' => $this->post_data['timeout'],
                'timeout' => $this->post_data['timeout'],
                'curl' => [
                    CURLOPT_SSL_VERIFYHOST => false,
                    CURLOPT_SSL_VERIFYPEER => false
                ]
            ]
        ];
    }

    /**
     * public function to send the API request
     * supports get requests only for now
     * $request_path and $method are required, $body is required for post requests only
     */
    public function api_request( $request_path, $method, $body = null )
    {
        switch($method)
        {
            case 'post':
                $response = Http::withOptions($this->guzzle_options)->post('https://' . $this->post_data['cvm'] . ':' . $this->post_data['port'] . $request_path, $body )->json();
            case 'get':
            default:
                $response = Http::asForm()->withOptions($this->guzzle_options)->get('https://' . $this->post_data['cvm'] . ':' . $this->post_data['port'] . $request_path )->json();
        }
        return $response;
    }
    
    /**
     * get information about the specified Prism Element cluster
     */
    public function read_demo()
    {

        $containerInfo = $this->api_request( '/api/nutanix/v2.0/storage_containers', 'get' );
        
        $containers = array();
        foreach ( $containerInfo[ 'entities' ] as $container ) {
            $containers[] = [
                'name' => $container[ 'name' ],
                'replicationFactor' => $container[ 'replication_factor' ],
                'compressionEnabled' => $container[ 'compression_enabled' ],
                'compressionDelay' => $container[ 'compression_delay_in_secs' ],
                'fingerprintOnWrite' => $container[ 'finger_print_on_write' ] == 'on' ? true : false,
                'onDiskDedup' => $container[ 'on_disk_dedup' ] == 'OFF' ? true : false,
            ];
        }

        $clusterInfo = $this->api_request( '/api/nutanix/v2.0/cluster', 'get' );

        $storage_info = [
            'ssd_used' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.ssd.usage_bytes' ],
            'ssd_free' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.ssd.free_bytes' ],
            'ssd_capacity' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.ssd.capacity_bytes' ],
            'hdd_used' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.das-sata.usage_bytes' ],
            'hdd_free' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.das-sata.free_bytes' ],
            'hdd_capacity' => $clusterInfo[ 'usage_stats' ][ 'storage_tier.das-sata.capacity_bytes' ],
        ];

        echo( json_encode( array(
            'result' => 'ok',
            'cluster-id' => $clusterInfo[ 'id' ],
            'cluster-name' => $clusterInfo[ 'name' ],
            'cluster-timezone' => $clusterInfo[ 'timezone' ],
            'cluster-numNodes' => $clusterInfo[ 'num_nodes' ],
            'cluster-enableShadowClones' => $clusterInfo[ 'enable_shadow_clones' ] === true ? "Yes" : "No",
            'cluster-blockZeroSn' => $clusterInfo[ 'block_serials' ][ 0 ],
            'cluster-IP' => $clusterInfo[ 'cluster_external_ipaddress' ] != '' ? $clusterInfo[ 'cluster_external_ipaddress' ] : 'No cluster IP configured',
            'cluster-nosVersion' => $clusterInfo[ 'version' ],
            'hypervisorTypes' => $clusterInfo[ 'hypervisor_types' ],
            'cluster-hasSED' => $clusterInfo[ 'has_self_encrypting_drive' ] ? 'Yes' : 'No',
            'cluster-numIOPS' => $clusterInfo[ 'stats' ][ 'num_iops' ] == 0 ? '0 IOPS ... awwww!  :)' : $clusterInfo[ 'stats' ][ 'num_iops' ] . ' IOPS',
            'containers' => $containers,
        ) ) );

    }

    /**
     * check if a storage container exists matching the requested name
     */
    public function container_exists( $name )
    {
        $containers = $this->api_request( '/api/nutanix/v2.0/storage_containers', 'get' );
        if( $containers['metadata']['grand_total_entities'] == 0 )
        {
            return false;
        }
        else
        {
            foreach( $containers['entities'] as $container )
            {
                if( $container['name'] == $name )
                {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * check if a vm exists matching the requested name
     */
    public function vm_exists( $name )
    {
        $vms = $this->api_request( '/api/nutanix/v2.0/vms', 'get' );
        if( $vms['metadata']['grand_total_entities'] == 0 )
        {
            return false;
        }
        else
        {
            foreach( $vms['entities'] as $vm )
            {
                if( $vm['name'] == $name )
                {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * create a storage container
     */
    public function container_demo()
    {
        if( $this->container_exists( $_POST['container-name'] ) )
        {
            return( json_encode( array(
                'result' => 'failed',
                'message' => 'A container with this name already exists.  Please submit the request again but use a different container name.'
            )));
        }
        else
        {
            $body = [
                'name' => $_POST['container-name']
            ];
            $response = $this->api_request( '/api/nutanix/v2.0/storage_containers', 'post', $body );
            return( json_encode( array(
                'result' => 'ok',
                'message' => 'Container created!'
            )));
        }
    }

    /**
     * get details about a specific VM
     */
    public function get_vm( $name ) {
        $vms = $this->api_request('/api/nutanix/v2.0/vms', 'get');
        foreach($vms['entities'] as $vm) {
            if($vm['name'] == $name) {
                return $vm;
            }
        }
    }

    /**
     * create the shell of a VM
     */
    public function shell_demo()
    {

        if( $this->vm_exists( $_POST['server-name']))
        {
            return( json_encode( array(
                'result' => 'failed',
                'message' => 'A VM with this name already exists.  Please submit the request again but use a different VM name.'
            )));
        }
        else
        {

            $containers = $this->api_request('/api/nutanix/v2.0/storage_containers', 'get');
            if( $containers['metadata']['grand_total_entities'] > 0) {

                $container_uuid = $containers['entities'][0]['storage_container_uuid'];
            
                $parameters = [];
                $server_name = $_POST['server-name'];
                switch( $_POST[ 'server-profile' ] )
                {
                    case 'exch':

                        $body = [
                            "description" => "Microsoft Exchange 2013 Mailbox, created by Nutanix API Demo",
                            "num_vcpus" => 2,
                            "name" => $server_name,
                            "memory_mb" => 8192,
                            "vm_disks" => [
                                [
                                    "is_cdrom" => false,
                                    "vm_disk_create" => [
                                        "size" => 128849018880,
                                        "storage_container_uuid" => $container_uuid
                                    ]
                                ],
                                [
                                    "is_cdrom" => false,
                                    "vm_disk_create" => [
                                        "size" => 536870912000,
                                        "storage_container_uuid" => $container_uuid
                                    ]
                                ]
                            ]
                        ];

                        break;
                    case 'dc':

                        $body = [
                            "description" => "Domain Controller, created by Nutanix API Demo",
                            "num_vcpus" => 1,
                            "name" => $server_name,
                            "memory_mb" => 2048,
                            "vm_disks" => [
                                [
                                    "is_cdrom" => false,
                                    "vm_disk_create" => [
                                        "size" => 268435456000,
                                        "storage_container_uuid" => $container_uuid
                                    ]
                                ]
                            ]
                        ];

                        break;
                    case 'lamp':

                        $body = [
                            "description" => "Web Server (LAMP), created by Nutanix API Demo",
                            "num_vcpus" => 1,
                            "name" => $server_name,
                            "memory_mb" => 4096,
                            "vm_disks" => [
                                [
                                    "is_cdrom" => false,
                                    "vm_disk_create" => [
                                        "size" => 42949672960,
                                        "storage_container_uuid" => $container_uuid
                                    ]
                                ]
                            ]
                        ];

                        break;
                }
                $response = $this->api_request( '/api/nutanix/v2.0/vms', 'post', $body );
                return( json_encode( array(
                    'result' => 'ok',
                    'message' => 'VM created!'
                )));
        }
        else {
            return( json_encode( array(
                'result' => 'failed',
                'message' => 'No storage containers were found in this cluster.  Please create at least 1 storage container, then submit the request again.'
            )));
        }
        
        }

    }

    /**
     * create a full VM w/ Cloud-init
     */
    public function cloud_init_demo()
    {
        $server_name = $_POST['server-name-custom'];
        // $server_name = 'test';
        if( $this->vm_exists( $server_name ) )
        {
            return( json_encode( array(
                'result' => 'failed',
                'message' => 'A VM with this name already exists.  Please submit the request again but use a different VM name.'
            )));
        }
        else
        {
            $containers = $this->api_request('/api/nutanix/v2.0/storage_containers', 'get');
            $container_uuid = '';
            if($containers['metadata']['grand_total_entities'] > 0) {
                $container_uuid = $containers['entities'][0]['storage_container_uuid'];
                $body = [
                    "description" => "Web Server (LAMP), created by Nutanix API Demo",
                    "num_vcpus" => 1,
                    "name" => $server_name,
                    "memory_mb" => 4096,
                    "vm_nics" => [
                        [
                            "network_uuid" => $_POST[ 'net-uuid' ],
                            "request_ip" => true
                        ]
                    ],
                    "vm_disks" => [
                        [
                            "is_cdrom" => false,
                            "vm_disk_clone" => [
                                "disk_address" => [
                                    "device_bus" => "SCSI",
                                    "vmdisk_uuid" => $_POST[ 'disk-uuid' ],
                                    "storage_container_uuid" => $container_uuid
                                ]
                            ]
                        ],
                        [
                            "is_cdrom" => false,
                            "vm_disk_create" => [
                                "size" => 128849018880,
                                "storage_container_uuid" => $container_uuid
                            ]
                        ]
                    ],
                    "vm_customization_config" => [
                        "datasource_type" => "Config_Drive_V2",
                        "userdata" => '#cloud-config
users:
- name: nutanix
sudo: ["ALL=(ALL) NOPASSWD:ALL"]
lock-passwd: false
passwd: $6$qxg9VycBEn76FVjP$mVdBH3ohk0FZEpiyooDa84PqYnknWqEOu50vh27iPi9kHUgiFmaWZAUIQFn8E3y2/p8m9GexK7WUyVLnfGmvp/

packages:
- httpd
package_upgrade: true
hostname: centos-web-auto
runcmd:
- systemctl enable httpd.service
- systemctl start httpd.service
- systemctl stop firewalld
- systemctl disable firewalld'
                    ]
                ];
            $response = $this->api_request('/api/nutanix/v2.0/vms', 'post', $body);
            sleep(3);
            /* power on the VM */
            $vm = $this->get_vm($server_name);
            $body = [
                'logicalTimestamp' => $vm[ 'vm_logical_timestamp' ],
                'uuid' => $vm[ 'uuid' ],
                'transition' => 'ON'
            ];
            $response = $this->api_request('/api/nutanix/v2.0/vms' . $vm['uuid'] . '/set_power_state', 'post', $body);
            return(json_encode(array(
                'result' => 'ok',
                'message' => 'Cloud-init VM created successfully'
            )));
            }
        }
    }

    /**
     * get cluster details
     * this function is used when deploying the Cloud-init VM
     */
    public function load_cluster_details()
    {
        $containerInfo = $this->api_request('/api/nutanix/v2.0/storage_containers', 'get');
        $containers = array();
        foreach($containerInfo['entities'] as $container) {
            $containers[] = [
                'name' => $container[ 'name' ],
                'id' => $container[ 'storage_container_uuid' ]
            ];
        }

        $netInfo = $this->api_request('/api/nutanix/v2.0/networks', 'get');
        $networks = array();
        foreach($netInfo['entities'] as $network) {
            $networks[] = [
                'name' => $network[ 'name' ],
                'vlanId' => $network[ 'vlan_id' ],
                'vlanUuid' => $network[ 'uuid' ]
            ];
        }

        $vdInfo = $this->api_request('/api/nutanix/v2.0/virtual_disks', 'get');
        $virtual_disks = array();
        foreach ($vdInfo['entities'] as $vd) {
            $virtual_disks[] = [
                'uuid' => $vd[ 'uuid' ],
                'vm_name' => $vd[ 'attached_vmname' ] != null ? $vd[ 'attached_vmname' ] : '&middot;&nbsp;Acropolis Image&nbsp;&middot;'
            ];
        }

        return(json_encode(array(
            'result' => 'ok',
            'containers' => $containers,
			'virtual_disks' => $virtual_disks,
			'networks' => $networks
        )));
    }
}