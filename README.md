# Plateforme d'appel vidéo

Cette plateforme utilise la technologie WebRTC, en s'appuyant sur l'infrastructure de Twilio STUN/TURN. 
Elle permet de passer des appels vidéo de qualité, avec un temps de latence moindre, indisponible avec les technologies traditionnelles.


## Fonctionnalités

- Partage d'écran
- Discussion par message
- Choix de la qualité vidéo automatique
- Aucun téléchargement, tout se passe sur le navigateur

## Pour commencer 


- Node.js est indispensable pour ce projet, assurez vous d'avoir la version 10.X ou la version 12.X
- Clonez ce projet

```
git clone https://github.com/moubymoud/appel-video
cd video-call
```

#### Ensuite

- Renommer le fichier .env.template à .env
- Créez un compte gratuit chez twilio https://www.twilio.com/
- Obtenez le SID et le Auth Token de votre compte à partir de votre console Twilio
- Ouvrez le fichier .env et remplissez le avec le SID et le Auth Token

#### Installez les modules 

```
npm install
```

#### Démarrer le serveur

```
npm start
```

- Ouvrez `localhost:3000` dans votre navigateur, et normalement, vous devez tomber sur la page d'acceuil. 
- Un certificat TLS est indispensable pour utiliser notre plateforme, Assurez vous d'en disposer.
  Nous vous recommandons d'utiliser [ngrok](https://ngrok.com/) pour tester la plateforme sur d'autres navigateur.