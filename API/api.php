<?php
$user_id_received = false;
$response = array();

if(isset($_GET['user_id']) && isset($_GET['encrypted'])){
    if($_GET['user_id'] != '' && $_GET['encrypted'] != ''){
        $user_id_received = true;
        
        class User{
            function __construct($id, $name, $hasPaidTax){
                $this->id = $id;
                $this->name = $name;
                $this->hasPaidTax = $hasPaidTax;
            }

            function getId(){
                return $this->id;
            }
            function getTaxPayment(){
                return $this->hasPaidTax;
            }
        }

        // generate new users
        $users = array(
            new User('IBRCL', 'Carl', true),
            new User('JVNKL', 'John', false),
            new User('82V4W', 'Elie', true),
            new User('PQ2HA', 'Joseph', true),
            new User('IBYXI', 'Alex', false),
            new User('IRXQD', 'Naomi', true),
            new User('DZFKS', 'Jennifer', false),
            new User('1EE5Y', 'Alexa', false),
            new User('WBE0D', 'Caroline', true),
            new User('SWT83', 'Levi', true)
        );

        function getUser($id){
            global $users;
            foreach($users as $user){
                if($user->getId() == $id){
                    return $user;
                }
            }
            return null;
        }

        function encryptResult($message){
            $method = "AES-256-CBC";
            $secret = "My32charPasswordAndInitVectorStr";  //must be 32 char length
            return encryptWithTimeStampValidation($message, $method, $secret);
        }

        function encrypt($message, $method, $secret) {
            $iv = substr($secret, 0, 16);
            return base64_encode($iv) . openssl_encrypt($message, $method, $secret, 0, $iv);
        }

        function encryptWithTimeStampValidation($message, $method, $secret) {
            date_default_timezone_set('UTC');
            $message = substr(date('c'),0,19) . "$message";
            return encrypt($message, $method, $secret);
        }        

        $user = getUser($_GET['user_id']);

        if(!is_null($user)){
            $response = array(
                'status' => 200,
                'user_tax_payment' => ($_GET['encrypted'] == 1)? encryptResult($user->getTaxPayment()) : $user->getTaxPayment()
            );
        }else{
            $response = array(
                'status' => 400,
                'message' => ($_GET['encrypted'] == 1)? encryptResult('User not found') : 'User not found'
            );
        }
        

        // $response = array(
        //     'message' => 'hello from API'
        // );
        // echo $response;
        // echo json_encode($response);

    }
}

if(!$user_id_received){ // will never be reached
    $response = array(
        'status' => '400',
        'message' => 'user_id and encrypted are required parameters'
    );
}
echo json_encode($response);