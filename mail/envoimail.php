<?php

$nom = trim($_POST['nom'] ?? '');
$prenom = trim($_POST['prenom'] ?? '');
$emailVisiteur = trim($_POST['email'] ?? '');
$objet = trim($_POST['objet'] ?? '');
$messageTexte = trim($_POST['message'] ?? '');

$destinataire = 'contact@iokeo.com';

$sujetEmail = "[Site IOKEO] " . $objet;

$corpsEmail = "Nouveau message depuis le formulaire de contact du site :\r\n\r\n" .
              "Nom : " . $nom . "\r\n" .
              "Prénom : " . $prenom . "\r\n" .
              "Email : " . $emailVisiteur . "\r\n" .
              "Objet : " . $objet . "\r\n\r\n" .
              "Message :\r\n" . $messageTexte . "\r\n";

$entetes = "From: Site IOKEO <no-reply@iokeo.com>\r\n" .
           "Reply-To: " . $emailVisiteur . "\r\n" .
           "Content-Type: text/plain; charset=UTF-8\r\n";

$succes = false;
if (!empty($nom) && !empty($emailVisiteur) && filter_var($emailVisiteur, FILTER_VALIDATE_EMAIL)) {
    $succes = mail($destinataire, $sujetEmail, $corpsEmail, $entetes);
}

if ($succes) {
    header("Location: ../pages/contacts.html?status=success");
} else {
    header("Location: ../pages/contacts.html?status=error");
}
exit();
