<?php

$id = $_GET['id'];

// a small nap to show of our spinner ;-)
sleep(1);

if( file_exists( $id ) ) {
  print implode("", file( $id ) );
} else {
  print <<<EOT
sheet error {
  text error <= "unknown diagram: $id"; 
}
EOT;
}
