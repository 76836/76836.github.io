<?php
$to = "somebody@example.com";
$subject = "My subject";
$txt = "Hello world!";
$headers = "From: nobody@www.com";

mail($to,$subject,$txt,$headers);
?>
