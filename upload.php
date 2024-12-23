<?php
  if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['image'])) {
    $uploadDir = 'img/watermarked/';
     $fileName = basename($_FILES['image']['name']);
     $uploadPath = $uploadDir . $fileName;
     if(move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)){
      echo json_encode(['status' => 'success', 'message' => 'Image uploaded successfully', 'filename' => $fileName]);
     } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to upload image.']);
     }
    } else {
         echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
   }
?>