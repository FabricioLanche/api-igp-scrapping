# API Web Scraping - Sismos IGP

API serverless para scrappear la tabla de sismos reportados del Instituto Geofísico del Perú (IGP) usando Puppeteer en AWS Lambda.

## 🚀 Características

- Scraping de SPA Angular con Puppeteer
- Almacenamiento en DynamoDB
- Serverless Framework
- CORS habilitado
- Optimizado para AWS Lambda

## 📋 Requisitos Previos

- Node.js >= 18.x
- AWS CLI configurado
- Serverless Framework instalado globalmente
- Cuenta AWS con acceso a Lambda y DynamoDB

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar Serverless Framework (si no lo tienes)

```bash
npm install -g serverless
```

### 3. Configurar credenciales AWS

```bash
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
```

## 🧪 Prueba Local

Antes de deployar, puedes probar el scraping localmente:

```bash
npm test
```

Esto ejecutará el scraping usando Puppeteer estándar (sin la capa de Chromium para Lambda).

## 🚀 Deploy

### Deploy a AWS

```bash
npm run deploy
```

O directamente:

```bash
serverless deploy
```

### Deploy a un stage específico

```bash
serverless deploy --stage production
```

### Ver logs en tiempo real

```bash
npm run logs
```

## 📡 Endpoints

Después del deploy, obtendrás un endpoint como:

```
GET https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/scrape/table
POST https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/scrape/table
```

### Ejemplo de uso

```bash
curl -X GET https://your-api-endpoint/scrape/table
```

## 📊 Respuesta de la API

### Respuesta exitosa (200)

```json
{
  "message": "Scraping completado exitosamente",
  "count": 12,
  "timestamp": "2025-11-19T10:30:00.000Z",
  "sismos": [
    {
      "reporte_sismico": "IGP/CENSIS/RS 2025-0764",
      "referencia": "12 km al N de Bagua, Bagua - Amazonas",
      "fecha_hora_local": "19/11/2025 02:22:52",
      "magnitud": "3.7",
      "enlace_reporte": "https://..."
    }
  ]
}
```

### Respuesta de error (500)

```json
{
  "message": "Error durante el scraping",
  "error": "Timeout waiting for selector",
  "stack": "..."
}
```

## 🗄️ Estructura de DynamoDB

### Tabla: TablaWebScrapping

**Clave primaria:**
- `id` (String): Identificador único del sismo

**Atributos:**
- `reporte_sismico`: Código del reporte
- `referencia`: Ubicación del sismo
- `fecha_hora_local`: Fecha y hora local
- `magnitud`: Magnitud del sismo (Number)
- `enlace_reporte`: URL del reporte completo
- `scraped_at`: Timestamp del scraping (ISO 8601)

**Índice secundario:**
- `ScrapedAtIndex`: Para consultar por fecha de scraping

## 🔍 Consultar DynamoDB

### Usando AWS CLI

```bash
aws dynamodb scan --table-name TablaWebScrapping --max-items 10
```

### Consultar por fecha de scraping

```bash
aws dynamodb query \
  --table-name TablaWebScrapping \
  --index-name ScrapedAtIndex \
  --key-condition-expression "scraped_at = :date" \
  --expression-attribute-values '{":date":{"S":"2025-11-19T10:30:00.000Z"}}'
```

## ⚙️ Configuración

### Ajustar memoria y timeout

En `serverless.yml`:

```yaml
provider:
  memorySize: 2048  # MB (Puppeteer necesita mínimo 1536MB)
  timeout: 90       # segundos
```

### Cambiar región

```yaml
provider:
  region: us-east-1  # Cambiar según necesites
```

## 🐛 Troubleshooting

### Error: "Timeout waiting for selector"

- Aumenta el timeout en el código
- Verifica que la URL sea accesible
- Revisa los logs: `serverless logs -f scrape_table -t`

### Error: "Task timed out after 90 seconds"

- Aumenta el timeout en `serverless.yml`
- Optimiza el scraping (menos datos, selectores más específicos)

### Error de memoria

- Aumenta `memorySize` en `serverless.yml` a 3008 MB

### Chrome no se ejecuta en Lambda

- Verifica que el ARN del layer de Chromium sea correcto
- Actualiza `@sparticuz/chromium` a la última versión

## 🗑️ Eliminar recursos

```bash
npm run remove
```

O:

```bash
serverless remove
```

## 📝 Notas Importantes

1. **Chromium Layer**: Este proyecto usa el layer público de Chromium para Lambda. Si no funciona, puedes crear tu propio layer.

2. **ARN del Layer**: El ARN puede cambiar según la región. Verifica en:
   - https://github.com/Sparticuz/chromium/releases

3. **Costos**: Ten en cuenta los costos de:
   - Invocaciones Lambda
   - Tiempo de ejecución Lambda
   - Operaciones de DynamoDB
   - Transferencia de datos

4. **Rate Limiting**: Considera implementar rate limiting si planeas scrappear frecuentemente.

## 🔐 Seguridad

- El IAM Role usado (`LabRole`) tiene permisos amplios. En producción, usa un role con permisos mínimos necesarios.
- Considera agregar API Keys o autenticación en producción.

## 📚 Recursos Adicionales

- [Puppeteer Documentation](https://pptr.dev/)
- [Serverless Framework](https://www.serverless.com/framework/docs)
- [Chromium for Lambda](https://github.com/Sparticuz/chromium)
- [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

## 📄 Licencia

ISC