<?php

$cfg_user_agent = "A random guy";

function lookup($name) {
    global $cfg_user_agent;

    // ---- Retrieve Character ID

    usleep(100000);
    $options = array(
	'http' => array(
	    'method'  => 'GET',
	    'header'  => array(
		'Host: api.eveonline.com',
		'User-Agent: ' . $cfg_user_agent,
	    ),
        ),
    );
    $result = file_get_contents('https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' . urlencode($name), false, stream_context_create($options));
    if (!$result) {
	return false;
    }
    $apiInfo = new SimpleXMLElement($result);
    $row = $apiInfo->result->rowset->row->attributes();
    $charId = $row->characterID;

    if ($charId == 0) {
	return false;
    }

    // ---- Retrieve Character Details

    usleep(100000);
    $options = array(
	'http' => array(
	    'method'  => 'GET',
	    'header'  => array(
		'Host: api.eveonline.com',
		'User-Agent: ' . $cfg_user_agent,
	    ),
        ),
    );
    $result = file_get_contents('https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' . $charId, false, stream_context_create($options));
    if (!$result) {
	return false;
    }
    $apiInfo = new SimpleXMLElement($result);
    $row = $apiInfo->result->rowset->row->attributes();

    $history = array();
    $birth = "";
    $first = true;
    foreach ($apiInfo->result->rowset->row as $i) {
	$birth = (string)$i->attributes()->startDate;

	if ($first) {
	    $first = false;
	    continue;
	}
	$history_entry = array(
	    'corporation_id' => (int)$i->attributes()->corporationID,
	    'corporation_name' => (string)$i->attributes()->corporationName,
	);
	array_push($history, $history_entry);
    }

    $result = array(
	'character_id' => (int)$charId,
	'character_name' => (string)$apiInfo->result->characterName[0],
	'security_status' => round(floatval($apiInfo->result->securityStatus),2),
	'birth' => $birth,
	'corporation_id' => (int)$apiInfo->result->corporationID,
	'corporation_name' => (string)$apiInfo->result->corporation[0],
	'alliance_id' => (int)$apiInfo->result->allianceID,
	'alliance_name' => (string)$apiInfo->result->alliance[0],
	'corporation_history' => $history,
    );

    return json_encode($result);
}

$result = false;

if (isset($_GET['name'])) {
    $result = lookup($_GET['name']);
}

if ($result) {
    header('Content-Type: application/json');
    echo $result;
} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
}

?>
