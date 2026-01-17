# 🌱 Smart Irrigation System — Architecture Microservices

[![Docker Compose](https://img.shields.io/badge/Docker-Compose-blue)](docker/docker-compose.yml)
[![Spring Boot](https://img.shields.io/badge/Spring-Boot-green)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Kafka](https://img.shields.io/badge/Apache-Kafka-231F20)](https://kafka.apache.org/)

Système d'irrigation intelligent basé sur une architecture microservices pour la gestion automatisée de l'irrigation agricole.

## 📋 Table des Matières
- [Description](#-description)
- [Architecture](#-architecture-générale)
- [Prérequis](#-prérequis)
- [Installation](#-installation-rapide)
- [Structure du Projet](#-structure-du-projet)
- [Services Détails](#-services-détails)
- [API Endpoints](#-api-endpoints)
- [Déploiement Docker](#-déploiement-docker)
- [Développement Local](#-développement-local)
- [Kubernetes (Optionnel)](#-kubernetes-optionnel)
- [Auteur & Licence](#-auteur--licence)

## 🎯 Description

Le **Smart Irrigation System** est une application distribuée qui permet :
- ✅ **Gestion de capteurs** (humidité, température, etc.)
- ✅ **Collecte automatique des mesures**
- ✅ **Décision intelligente d'irrigation** basée sur des règles métier
- ✅ **Visualisation web** des données et statistiques
- ✅ **Déploiement conteneurisé** avec Docker
- ✅ **Architecture évolutive** en microservices

## 🏗️ Architecture Générale

### Technologies Utilisées
| Couche | Technologies |
|--------|--------------|
| **Frontend** | Angular 14+, Nginx |
| **API Gateway** | Spring Cloud Gateway |
| **Service Discovery** | Netflix Eureka |
| **Configuration** | Spring Cloud Config Server |
| **Microservices** | Spring Boot 3.x, Spring Cloud |
| **Messagerie** | Apache Kafka |
| **Bases de données** | MySQL, H2 (développement) |
| **Conteneurisation** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (optionnel) |

### Architecture Logique
```
┌─────────────────┐
│   Angular UI    │ http://localhost:4200
└────────┬────────┘
         │
┌────────▼────────┐
│  API Gateway    │ http://localhost:8222
│ (Spring Gateway)│
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼───┐ ┌───▼──────┐
│Capteur│ │Irrigation│
│Service│ │ Service  │
└───┬───┘ └────┬─────┘
    │          │
    └────┬─────┘
         │
    ┌────▼────┐
    │  Kafka  │
    │ (Broker)│
    └─────────┘
```

## ⚙️ Prérequis

- **Docker** 20.10+ et **Docker Compose** 2.0+
- **Java** 17+ (pour développement)
- **Node.js** 18+ et **npm** 9+ (pour développement frontend)
- **Git** 2.30+

## 🚀 Installation Rapide

### Option 1 : Avec Docker (Recommandé)
```bash
# 1. Cloner le dépôt
git clone https://github.com/waeltayeb/system-irrigation.git
cd system-irrigation

# 2. Lancer tous les services
cd docker
docker compose up -d

# 3. Vérifier l'état des services
docker compose ps
```

### Option 2 : Développement Local
```bash
# 1. Cloner le dépôt
git clone https://github.com/waeltayeb/system-irrigation.git
cd system-irrigation

# 2. Démarrer les services d'infrastructure
docker compose -f docker/docker-compose-infra.yml up -d

# 3. Démarrer les microservices (dans des terminaux séparés)
# Service de configuration
cd backend/config-server
./mvnw spring-boot:run

# Service Eureka
cd backend/eureka-server
./mvnw spring-boot:run

# ... etc. pour chaque service
```

## 📁 Structure du Projet
```
system-irrigation/
├── backend/                    # Services backend Java
│   ├── config-server/         # Serveur de configuration centralisée
│   ├── eureka-server/         # Service Discovery (Eureka)
│   ├── gateway-api/           # API Gateway
│   ├── capteur-service/       # Gestion des capteurs et mesures
│   └── irrigation-service/    # Gestion de l'irrigation
├── frontend/                  # Application Angular
│   └── irrigation-ui/
│       ├── src/
│       ├── angular.json
│       └── package.json
├── docker/                    # Configuration Docker
│   ├── docker-compose.yml
│   └── dockerfiles/                     
└── README.md
```

## 🔧 Services Détails

### 1. **Config Server** (`:8888`)
- Centralisation des configurations
- Support multi-environnements
- URL: http://localhost:8888

### 2. **Eureka Server** (`:8761`)
- Service Discovery et Registry
- Monitoring des instances
- **Dashboard**: http://localhost:8761

### 3. **API Gateway** (`:8222`)
- Point d'entrée unique
- Routage dynamique
- Gestion CORS
- **URL**: http://localhost:8222

### 4. **Capteur Service** (`:8081`)
- Gestion CRUD des capteurs
- Collecte des mesures
- Production Kafka
- **URL**: http://localhost:8081

### 5. **Irrigation Service** (`:8082`)
- Gestion des parcelles
- Décision automatique d'irrigation
- Consommation Kafka
- **URL**: http://localhost:8082

### 6. **Frontend Angular** (`:4200`)
- Interface utilisateur
- Visualisation en temps réel
- **URL**: http://localhost:4200

### 7. **Infrastructure**
- **Kafka**: `:9092` (Broker)
- **ZooKeeper**: `:2181`
- **MySQL**: `:3306`

## 🌐 API Endpoints

### Via API Gateway (`http://localhost:8222`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET`   | `/api/capteurs` | Liste des capteurs |
| `POST`  | `/api/capteurs` | Créer un capteur |
| `GET`   | `/api/capteurs/{id}` | Détails d'un capteur |
| `GET`   | `/api/mesures/latest/{capteurId}` | Dernière mesure |
| `POST`  | `/api/mesures` | Enregistrer une mesure |
| `GET`   | `/api/parcelles` | Liste des parcelles |
| `POST`  | `/api/parcelles` | Créer une parcelle |
| `GET`   | `/api/irrigations/history` | Historique d'irrigation |

## 🐳 Déploiement Docker

### Fichier docker-compose.yml
```yaml
version: '3.8'
services:
  # Infrastructure
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
  kafka:
    image: confluentinc/cp-kafka:latest
  mysql:
    image: mysql:8.0
  
  # Services Spring Boot
  config-server:
    build: ../backend/config-server
  eureka-server:
    build: ../backend/eureka-server
  # ... autres services
```

### Commandes utiles
```bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Voir les logs
docker compose logs -f

# Reconstruire et redémarrer
docker compose up -d --build

# Nettoyer (supprime volumes)
docker compose down -v
```

## 💻 Développement Local

### Backend (Spring Boot)
```bash
# Configurer la base de données
mysql -u root -p < scripts/init-db.sql

# Lancer chaque service (dans l'ordre)
# 1. Config Server
cd backend/config-server
./mvnw spring-boot:run -Dspring-boot.run.profiles=native

# 2. Eureka Server
cd backend/eureka-server
./mvnw spring-boot:run

# 3. Services métier...
```

### Frontend (Angular)
```bash
cd frontend/irrigation-ui

# Installation des dépendances
npm install

# Développement avec hot-reload
ng serve

# Build pour production
ng build --prod
```

### Variables d'environnement
```bash
# Exemple .env
SPRING_PROFILES_ACTIVE=dev
EUREKA_SERVER_URL=http://localhost:8761/eureka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## ☸️ Kubernetes (Optionnel)

### Prérequis
- Minikube ou cluster Kubernetes
- kubectl configuré
- Helm (optionnel)

### Déploiement
```bash
# Appliquer les manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/ -R

# Vérifier le déploiement
kubectl get all -n irrigation-system

# Accéder à l'application
minikube service gateway-service -n irrigation-system
```

## 🧪 Tests

### Tests Unitaires
```bash
# Backend
cd backend/capteur-service
./mvnw test

# Frontend
cd frontend/irrigation-ui
npm test
```

### Tests d'Intégration
```bash
# Lancer la suite de tests
./scripts/run-tests.sh

# Tests avec Postman
# Collection disponible dans /docs/postman/
```

## 🔍 Monitoring et Debugging

### URLs d'Accès
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8222
- **Frontend**: http://localhost:4200
- **Actuator Endpoints**: http://localhost:8081/actuator/health

### Logs
```bash
# Voir les logs d'un service
docker compose logs -f capteur-service

# Logs avec timestamps
docker compose logs --timestamps
```

## 🚨 Dépannage

### Problèmes Courants
1. **Ports déjà utilisés**
   ```bash
   # Vérifier les ports
   netstat -tulpn | grep :8222
   
   # Changer les ports dans .env
   ```

2. **Kafka non démarré**
   ```bash
   # Vérifier l'état de Kafka
   docker compose logs kafka
   
   # Redémarrer Kafka
   docker compose restart kafka
   ```

3. **Services non enregistrés dans Eureka**
   - Vérifier la connexion réseau Docker
   - Vérifier les logs Eureka
   - Redémarrer les services

### Nettoyage
```bash
# Supprimer containers, réseaux, volumes
docker compose down -v --remove-orphans

# Nettoyer les images non utilisées
docker system prune -a
```

## 📈 Roadmap

- [x] Phase 1: Infrastructure de base
- [x] Phase 2: Service Capteurs avec Kafka
- [x] Phase 3: Service Irrigation avec règles métier
- [x] Phase 4: Interface Angular
- [x] Phase 5: Dockerisation complète
- [ ] Phase 6: Monitoring avec Prometheus/Grafana
- [ ] Phase 7: Tests de charge et optimisation
- [ ] Phase 8: Intégration CI/CD

## 👨‍💻 Auteur & Licence

### Auteur
- **Nom**: Wael Taieb
- **GitHub**: [@waeltayeb](https://github.com/waeltayeb)
- **Email**: wael.tayeb@example.com

### Licence
Ce projet est à but **pédagogique et académique**. 
Utilisation libre pour l'apprentissage et les démonstrations.

### Contribution
Les contributions sont les bienvenues ! 
1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Remerciements
- Spring Boot et Spring Cloud Teams
- Apache Kafka Community
- Angular Team
- Tous les contributeurs open-source

---



**⭐ Si ce projet vous est utile, n'hésitez pas à mettre une étoile sur GitHub !**

