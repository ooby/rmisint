## Orchestrator-сервер для интеграционных сервисов [RMIS](https://www.rtlabs.ru/projects/regionalnaya-meditsinskaya-informatsionnaya-sistema-rmis/)

1. `npm i`
2. Создать файл конфигурации `config/config.json`:
```json
{
    "config": {
        "timeout": 900000, // таймаут синхронизации в миллисекундах
        "rmis": {
            "auth": {
                "username": "username",
                "password": "password"
            },
            "path": "https://dev.is-mis.ru/",
            "clinicId": 1, // ID медицинского учреждения в RMIS
            "allowedServices": [
                "appointment-ws/appointment",
                "employees-ws/service",
                "departments-ws/departments",
                "individuals-ws/individuals",
                "locations-ws/resources",
                "patients-ws/patient",
                "refbooks-ws/refbooksWS",
                "rooms-ws/rooms"
            ]
        },
        "er14": {
            "muCode": 1, // Код медицинского учреждения в системе ОМС
            "path": "URL", // er14 wsdl url
            "refbooks": "URL" // rias.mzsakha.ru wsdl url
        },
        "mongoose": {
            "host": "127.0.0.1", // IP-адрес mongoDb
            "port": 27017, // порт mongoDb
            "username": "user",
            "password": "password",
            "db": "refbook", // имя базы данных для сохранения
            "options": {
                "useMongoClient": true,
                "socketTimeoutMS": 10000,
                "keepAlive": true,
                "reconnectTries": 30
            }
        }
    }
}
```
3. `npm start`