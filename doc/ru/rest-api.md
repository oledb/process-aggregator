# Rest Api

## `POST /tasks`

Создает задачу запуская процесс для нее.

### Body

В данном запросе передается объект с набором параметров необходимым для создания задачи.

```json
{}
```

### Response

#### 201

```json
{
  "id": "string",
  "status": "string",
  "processName": {
    "name": "string",
    "version": "string"
  },
  "payload": {}
}
```

Задача успешно создана.

#### 400 - `CommandValidationException`

При создании задачи возникла ошибка валидации

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 400
}
```

## `POST /task/{id}/invoke/{command}`

Вызов команды, которая переведет задачу в другой статус в соответствии с описанной бизнес-логикой.

### Response

#### 200

```json
{
  "id": "string",
  "status": "string",
  "processName": {
    "name": "string",
    "version": "string"
  },
  "payload": {}
}
```

#### 404 - `NotFoundException`

Задачи с таким id не существует

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 404
}
```

#### 400 - `CommandValidationException`

При произошла ошибка валидации пере выполнением action

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 400
}
```

## `GET /task/{id}/command`

Возвращает список команд доступных для задачи у казанным id.

### Response

#### 200

```json
["string"]
```

#### 404 - `NotFoundException`

Задачи с таким id не существует

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 404
}
```

## `GET /task`

Возвращает список всех задач, доступных в репозитории. Фильтрация задач в данный момент не реализована и будет добавлена позднее.

### Response

#### 200

```json
[{
  "id": "string",
  "status": "string",
  "processName": {
    "name": "string",
    "version": "string"
  },
  "payload": {}
}]
```

## `GET /task/{id}`

Возвращает существующую задачу по ее id.

### Response

#### 200

```json
{
  "id": "string",
  "status": "string",
  "processName": {
    "name": "string",
    "version": "string"
  },
  "payload": {}
}
```

#### 400 - `ValidationException`

Задача недоступна для чтения

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 404
}
```

#### 404 - `NotFoundException`

Задачи с таким статусом не существует

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 404
}
```

## `PUT /task/{id}/payload`

### Body

В теле запроса передается Payload задачи

### Response

#### 200

```json
{
  "id": "string",
  "status": "string",
  "processName": {
    "name": "string",
    "version": "string"
  },
  "payload": {}
}
```

#### 400 - `ValidationException`

Переданные поля не являются валидными.

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 400
}
```

#### 404 NotFoundException

Задачи с таким статусом не существует

```json
{
  "message": "string",
  "error": "string",
  "statusCode": 404
}
```
