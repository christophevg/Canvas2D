<?php

$id = $_GET['id'];

sleep(2);

print implode("", file( $id ) );