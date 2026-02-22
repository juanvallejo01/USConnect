# Campus Circle - Especificación Técnica del Backend

## 📋 ÍNDICE
1. [Endpoints Requeridos](#endpoints-requeridos)
2. [Validaciones Críticas](#validaciones-críticas)
3. [Reglas Definitivas](#reglas-definitivas)
4. [Invariantes del Sistema](#invariantes-del-sistema)
5. [Edge Cases](#edge-cases)
6. [Modelos de Datos](#modelos-de-datos)

---

## 🔌 ENDPOINTS REQUERIDOS

### **1. AUTENTICACIÓN**

#### `POST /api/auth/register`
**Request Body:**
```json
{
  "email": "student@usc.edu",
  "password": "SecurePass123!",
  "name": "Sarah Miller",
  "major": "Film Production",
  "year": "Junior",
  "bio": "Film major who loves golden hour shots",
  "interests": ["Photography", "Design", "Film"]
}
```
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "student@usc.edu",
    "name": "Sarah Miller",
    "avatar": "default-avatar-url",
    "major": "Film Production"
  },
  "token": "jwt-token-here"
}
```
**Validaciones:**
- Email debe ser dominio universitario (@usc.edu)
- Password mínimo 8 caracteres
- Name no vacío, max 100 caracteres
- Major debe existir en lista de carreras válidas
- Bio max 500 caracteres
- Interests max 10 elementos

---

#### `POST /api/auth/login`
**Request Body:**
```json
{
  "email": "student@usc.edu",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt-token-here"
}
```

---

#### `POST /api/auth/logout`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **2. USUARIOS**

#### `GET /api/users/:id`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "id": 1,
  "name": "Sarah Miller",
  "avatar": "avatar-url",
  "major": "Film Production",
  "year": "Junior",
  "bio": "Film major who loves golden hour shots",
  "interests": ["Photography", "Design", "Film"],
  "likesReceived": 45,
  "rank": 12
}
```
**Validaciones:**
- Usuario autenticado
- Usuario existe

---

#### `PUT /api/users/:id`
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "bio": "Updated bio text",
  "interests": ["Photography", "Design", "Film", "Coffee"]
}
```
**Response:**
```json
{
  "success": true,
  "user": { /* updated user */ }
}
```
**Validaciones:**
- Solo el dueño puede actualizar su perfil
- Bio max 500 caracteres
- Interests max 10 elementos

---

#### `GET /api/users/explore`
**Headers:** `Authorization: Bearer {token}`
**Query Params:** `?limit=10&offset=0&exclude={userId}`
**Response:**
```json
{
  "users": [
    {
      "id": 2,
      "name": "James Chen",
      "avatar": "avatar-url",
      "major": "Computer Science",
      "age": 22,
      "bio": "CS major, part-time DJ",
      "interests": ["Music", "Basketball", "CS"]
    }
  ],
  "hasMore": true
}
```
**Validaciones:**
- Excluir al usuario actual
- Excluir usuarios ya mostrados (si se implementa cache)
- Limit max 50

---

### **3. LIKES (CORE)**

#### `POST /api/likes`
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "receiverId": 2
}
```
**Response:**
```json
{
  "success": true,
  "like": {
    "id": 123,
    "senderId": 1,
    "receiverId": 2,
    "createdAt": "2026-02-21T10:30:00Z"
  },
  "matched": false
}
```
**Response (si hay match):**
```json
{
  "success": true,
  "like": { /* like object */ },
  "matched": true,
  "match": {
    "id": 456,
    "userA": 1,
    "userB": 2,
    "createdAt": "2026-02-21T10:30:00Z"
  }
}
```

**VALIDACIONES CRÍTICAS:**
- ✅ senderId != receiverId (no self-likes)
- ✅ Like no existe previamente (no duplicados)
- ✅ Receiver existe
- ✅ Transacción atómica (like + match si aplica)
- ✅ Si existe like inverso, crear match automáticamente

---

#### `GET /api/likes/received`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "likes": [
    {
      "id": 1,
      "sender": {
        "id": 2,
        "name": "James Chen",
        "avatar": "avatar-url"
      },
      "createdAt": "2026-02-21T10:30:00Z"
    }
  ],
  "total": 45
}
```

---

#### `GET /api/likes/sent`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "likes": [
    {
      "id": 1,
      "receiver": {
        "id": 3,
        "name": "Emily Davis",
        "avatar": "avatar-url"
      },
      "createdAt": "2026-02-21T10:30:00Z"
    }
  ],
  "total": 12
}
```

---

#### `GET /api/likes/check/:userId`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "hasLiked": true,
  "likeId": 123
}
```

---

### **4. MATCHES (CORE)**

#### `GET /api/matches`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "matches": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "James Chen",
        "avatar": "avatar-url",
        "major": "Computer Science"
      },
      "createdAt": "2026-02-21T10:30:00Z",
      "lastMessage": {
        "text": "Hey! Are you going to the event?",
        "createdAt": "2026-02-21T11:00:00Z",
        "unread": true
      }
    }
  ]
}
```

---

#### `GET /api/matches/check/:userId`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "isMatched": true,
  "matchId": 456
}
```
**Validaciones:**
- Verificar que ambos usuarios se hayan dado like

---

### **5. MENSAJES (CHAT)**

#### `POST /api/messages`
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "receiverId": 2,
  "text": "Hey! How's it going?"
}
```
**Response:**
```json
{
  "success": true,
  "message": {
    "id": 789,
    "senderId": 1,
    "receiverId": 2,
    "text": "Hey! How's it going?",
    "createdAt": "2026-02-21T12:00:00Z",
    "read": false
  }
}
```

**VALIDACIONES CRÍTICAS:**
- ✅ Usuarios deben estar matched
- ✅ Text no vacío, max 1000 caracteres
- ✅ receiverId existe
- ✅ senderId != receiverId

---

#### `GET /api/messages/:userId`
**Headers:** `Authorization: Bearer {token}`
**Query Params:** `?limit=50&before={messageId}`
**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "senderId": 1,
      "receiverId": 2,
      "text": "Hey!",
      "createdAt": "2026-02-21T10:00:00Z",
      "read": true
    }
  ],
  "hasMore": false
}
```
**Validaciones:**
- Usuario debe estar matched con :userId
- Limit max 100

---

#### `PUT /api/messages/:conversationId/read`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "updatedCount": 5
}
```
**Validaciones:**
- Solo marcar como leídos mensajes donde el usuario es receiver

---

### **6. POSTS (FEED)**

#### `POST /api/posts`
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "content": "Study group for midterms anyone?",
  "imageUrl": "optional-image-url"
}
```
**Response:**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "userId": 1,
    "content": "Study group for midterms anyone?",
    "imageUrl": null,
    "likes": 0,
    "comments": 0,
    "createdAt": "2026-02-21T12:00:00Z"
  }
}
```
**Validaciones:**
- Content no vacío, max 1000 caracteres
- Si imageUrl, validar formato y tamaño

---

#### `GET /api/posts`
**Headers:** `Authorization: Bearer {token}`
**Query Params:** `?limit=20&offset=0`
**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "Sarah Miller",
        "avatar": "avatar-url",
        "major": "Film Production"
      },
      "content": "Golden hour on campus 🌅",
      "imageUrl": "image-url",
      "likes": 45,
      "comments": 12,
      "createdAt": "2026-02-21T10:00:00Z",
      "hasLiked": false
    }
  ],
  "hasMore": true
}
```

---

#### `POST /api/posts/:id/like`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "likes": 46
}
```

---

#### `POST /api/posts/:id/comment`
**Headers:** `Authorization: Bearer {token}`
**Request Body:**
```json
{
  "content": "This is stunning!"
}
```
**Response:**
```json
{
  "success": true,
  "comment": {
    "id": 1,
    "userId": 2,
    "postId": 1,
    "content": "This is stunning!",
    "createdAt": "2026-02-21T12:00:00Z"
  }
}
```

---

### **7. NOTIFICACIONES**

#### `GET /api/notifications`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 1,
      "type": "match",
      "matchedWithId": 2,
      "matchedWithName": "James Chen",
      "matchedWithAvatar": "avatar-url",
      "read": false,
      "createdAt": "2026-02-21T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

#### `PUT /api/notifications/:id/read`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true
}
```

---

#### `PUT /api/notifications/read-all`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "updatedCount": 3
}
```

---

### **8. RANKINGS (LEADERBOARD)**

#### `GET /api/rankings`
**Headers:** `Authorization: Bearer {token}`
**Query Params:** `?limit=10`
**Response:**
```json
{
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "name": "Jordan Lee",
        "avatar": "avatar-url",
        "major": "Psychology"
      },
      "likesReceived": 89
    }
  ]
}
```
**Validaciones:**
- Limit max 100
- Ordenar por likesReceived DESC

---

#### `GET /api/rankings/:userId`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "rank": 12,
  "likesReceived": 45,
  "percentile": 85
}
```

---

### **9. ADMIN**

#### `GET /api/admin/stats`
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "totalUsers": 2847,
  "activeToday": 412,
  "totalLikes": 15234,
  "totalMatches": 1823,
  "totalNotifications": 3456,
  "avgLikesPerUser": 5.35
}
```
**Validaciones:**
- Solo usuarios con rol admin

---

## ✅ VALIDACIONES CRÍTICAS

### **Validaciones a Nivel de Datos**

#### **Usuarios**
```javascript
// Email
- Must be valid email format
- Must be university domain (@usc.edu)
- Must be unique
- Cannot be changed after registration

// Password
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special char
- Hashed with bcrypt (cost factor 12)

// Name
- Not empty
- Max 100 characters
- Only letters, spaces, hyphens

// Major
- Must exist in predefined list of majors
- Cannot be empty

// Bio
- Max 500 characters
- Optional

// Interests
- Array of strings
- Max 10 elements
- Each element max 50 characters
```

#### **Likes**
```javascript
// REGLA CRÍTICA: Likes son PERMANENTES
- senderId != receiverId (NO self-likes)
- Like (senderId, receiverId) debe ser ÚNICO
- No existe DELETE endpoint para likes
- receiverId debe existir
- senderId debe estar autenticado

// Lógica de Match
IF EXISTS like WHERE senderId = B AND receiverId = A
AND EXISTS like WHERE senderId = A AND receiverId = B
THEN CREATE match WHERE userA = MIN(A,B) AND userB = MAX(A,B)
```

#### **Matches**
```javascript
// Match solo existe si:
- EXISTS like(A → B)
- AND EXISTS like(B → A)
- Match es PERMANENTE
- userA < userB (para evitar duplicados)
- createdAt = timestamp del segundo like
```

#### **Mensajes**
```javascript
// REGLA CRÍTICA: Chat requiere match
- sendMessage() debe validar isMatched(sender, receiver)
- text no vacío
- text max 1000 caracteres
- senderId != receiverId
- Si no hay match, retornar 403 Forbidden

// Validación en middleware
function requireMatch(req, res, next) {
  const { senderId, receiverId } = req.body
  const isMatched = await Match.exists({
    $or: [
      { userA: senderId, userB: receiverId },
      { userA: receiverId, userB: senderId }
    ]
  })
  if (!isMatched) {
    return res.status(403).json({ 
      error: "Match required to send messages" 
    })
  }
  next()
}
```

#### **Posts**
```javascript
// Content
- Not empty
- Max 1000 characters
- No spam detection (rate limit)

// Images
- Optional
- Max size 5MB
- Formats: jpg, png, webp
- Store in CDN/S3
```

---

## 🔒 REGLAS DEFINITIVAS

### **1. LIKES SON PERMANENTES**
```
❌ NUNCA implementar DELETE /api/likes/:id
❌ NUNCA permitir "unlike"
✅ Like es una decisión definitiva
✅ Fomenta likes estratégicos y pensados
```

### **2. MATCH REQUIERE MUTUALIDAD**
```
✅ Match = like(A→B) AND like(B→A)
✅ Match se crea automáticamente
✅ Match es permanente
❌ No se puede "unmatch"
```

### **3. CHAT SOLO CON MATCH**
```
✅ sendMessage() valida match SIEMPRE
✅ Validación en frontend Y backend
✅ Si no hay match: 403 Forbidden
❌ No mensajes sin match (NUNCA)
```

### **4. RANKING SOLO POR LIKES**
```
✅ CampusRank = COUNT(likes WHERE receiverId = userId)
❌ No puntos por posts
❌ No puntos por comentarios
❌ No puntos por mensajes
✅ Solo likes recibidos cuentan
```

### **5. NOTIFICACIONES SOLO PARA MATCHES**
```
✅ Crear notificación cuando se forma match
✅ Notificar a AMBOS usuarios
❌ No spam de notificaciones
❌ No notificaciones de likes sin match
```

---

## 🚨 INVARIANTES DEL SISTEMA (NUNCA ROMPER)

### **Invariante 1: Like Uniqueness**
```sql
-- Constraint en DB
UNIQUE INDEX unique_like ON likes(senderId, receiverId);

-- Validación en código
async function createLike(senderId, receiverId) {
  const existing = await Like.findOne({ senderId, receiverId })
  if (existing) {
    throw new Error('Like already exists')
  }
  // crear like...
}
```

### **Invariante 2: No Self-Likes**
```sql
-- Constraint en DB
CHECK (senderId != receiverId);

-- Validación en código
if (senderId === receiverId) {
  throw new Error('Cannot like yourself')
}
```

### **Invariante 3: Match Consistency**
```javascript
// Match solo existe si hay likes mutuos
async function ensureMatchConsistency(userA, userB) {
  const likeAtoB = await Like.findOne({ 
    senderId: userA, 
    receiverId: userB 
  })
  const likeBtoA = await Like.findOne({ 
    senderId: userB, 
    receiverId: userA 
  })
  
  const match = await Match.findOne({
    $or: [
      { userA: Math.min(userA, userB), userB: Math.max(userA, userB) }
    ]
  })
  
  // INVARIANTE: match existe SSI ambos likes existen
  const shouldExist = likeAtoB && likeBtoA
  const exists = !!match
  
  if (shouldExist !== exists) {
    // ALERTA CRÍTICA: inconsistencia detectada
    logger.error('Match consistency violation', { userA, userB })
    // Reparar automáticamente
    if (shouldExist && !exists) {
      await Match.create({ 
        userA: Math.min(userA, userB), 
        userB: Math.max(userA, userB) 
      })
    }
  }
}
```

### **Invariante 4: Match Order**
```sql
-- Para evitar duplicados
-- Siempre userA < userB
CHECK (userA < userB);
UNIQUE INDEX unique_match ON matches(userA, userB);
```

### **Invariante 5: No Messages Without Match**
```javascript
// Middleware en TODAS las rutas de mensajes
app.post('/api/messages', requireMatch, async (req, res) => {
  // solo ejecuta si hay match
})
```

### **Invariante 6: Notification on Match**
```javascript
// Trigger automático al crear match
async function createMatch(userA, userB) {
  const match = await Match.create({ userA, userB })
  
  // DEBE crear notificaciones para ambos
  await Promise.all([
    Notification.create({
      userId: userA,
      type: 'match',
      matchedWithId: userB,
      // ... datos del userB
    }),
    Notification.create({
      userId: userB,
      type: 'match',
      matchedWithId: userA,
      // ... datos del userA
    })
  ])
  
  return match
}
```

---

## 🔍 EDGE CASES A CUBRIR

### **Edge Case 1: Race Condition en Likes**
```
Escenario:
- User A y User B dan like simultáneamente

Problema:
- Pueden crearse 2 matches

Solución:
- Transaction con lock
- Unique constraint en DB
- Idempotencia en creación de match

Código:
async function createLikeAndMatch(senderId, receiverId) {
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    // Crear like
    const like = await Like.create([{ senderId, receiverId }], { session })
    
    // Buscar like inverso
    const inverseLike = await Like.findOne({ 
      senderId: receiverId, 
      receiverId: senderId 
    }).session(session)
    
    let match = null
    if (inverseLike) {
      // Intentar crear match (puede fallar si ya existe)
      try {
        match = await Match.create([{
          userA: Math.min(senderId, receiverId),
          userB: Math.max(senderId, receiverId)
        }], { session })
      } catch (e) {
        // Match ya existe, ignorar
        match = await Match.findOne({
          userA: Math.min(senderId, receiverId),
          userB: Math.max(senderId, receiverId)
        }).session(session)
      }
    }
    
    await session.commitTransaction()
    return { like, match }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
```

### **Edge Case 2: Usuario Eliminado**
```
Escenario:
- Usuario A tiene match con B
- Usuario B elimina su cuenta

Solución:
- Soft delete (isDeleted flag)
- Mantener datos para integridad referencial
- Filtrar usuarios eliminados en queries

Código:
// Modelo User
const UserSchema = new Schema({
  email: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
})

// Middleware global
UserSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: false })
  next()
})

// Delete endpoint
async function deleteUser(userId) {
  await User.updateOne(
    { _id: userId },
    { 
      isDeleted: true, 
      deletedAt: new Date(),
      email: `deleted_${Date.now()}@deleted.com` // liberar email
    }
  )
}
```

### **Edge Case 3: Spam de Likes**
```
Escenario:
- Usuario da 100 likes en 1 minuto

Solución:
- Rate limiting por usuario
- Max 20 likes por minuto
- Max 100 likes por día

Código:
const rateLimit = require('express-rate-limit')

const likeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 requests
  keyGenerator: (req) => req.user.id,
  message: 'Too many likes, please slow down'
})

app.post('/api/likes', likeLimiter, createLike)

// Daily limit
async function checkDailyLikeLimit(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const count = await Like.countDocuments({
    senderId: userId,
    createdAt: { $gte: today }
  })
  
  if (count >= 100) {
    throw new Error('Daily like limit reached')
  }
}
```

### **Edge Case 4: Mensajes a Usuario No Matcheado**
```
Escenario:
- Frontend tiene bug
- Usuario intenta enviar mensaje sin match

Solución:
- Validación en backend SIEMPRE
- Retornar 403 con mensaje claro
- Log de intentos sospechosos

Código:
async function sendMessage(req, res) {
  const { receiverId, text } = req.body
  const senderId = req.user.id
  
  // VALIDACIÓN CRÍTICA
  const isMatched = await Match.exists({
    $or: [
      { userA: Math.min(senderId, receiverId), 
        userB: Math.max(senderId, receiverId) }
    ]
  })
  
  if (!isMatched) {
    // Log intento sospechoso
    logger.warn('Attempt to message without match', {
      senderId,
      receiverId,
      ip: req.ip
    })
    
    return res.status(403).json({
      error: 'MATCH_REQUIRED',
      message: 'You must be matched to send messages'
    })
  }
  
  // Crear mensaje...
}
```

### **Edge Case 5: Notificación Duplicada**
```
Escenario:
- Match se crea
- Notificación falla
- Retry crea notificación duplicada

Solución:
- Unique constraint en notificaciones
- Idempotency key
- Check before insert

Código:
async function createMatchNotification(userId, matchedWithId, matchId) {
  // Verificar si ya existe
  const existing = await Notification.findOne({
    userId,
    type: 'match',
    matchedWithId,
    matchId
  })
  
  if (existing) {
    return existing // Idempotente
  }
  
  return await Notification.create({
    userId,
    type: 'match',
    matchedWithId,
    matchId,
    // ... otros datos
  })
}
```

### **Edge Case 6: Like a Usuario Inexistente**
```
Escenario:
- Frontend tiene ID de usuario que no existe
- Usuario fue eliminado

Solución:
- Validar que receiverId existe
- Retornar 404 si no existe

Código:
async function createLike(senderId, receiverId) {
  // Validar receiver existe
  const receiver = await User.findOne({ 
    _id: receiverId, 
    isDeleted: false 
  })
  
  if (!receiver) {
    throw new Error('User not found')
  }
  
  // Crear like...
}
```

### **Edge Case 7: Carga del Leaderboard**
```
Escenario:
- 10,000 usuarios
- Calcular likes de todos es lento

Solución:
- Cache en Redis
- Actualización incremental
- Denormalizar likesCount en User

Código:
// Modelo User con campo denormalizado
const UserSchema = new Schema({
  name: String,
  likesReceived: { type: Number, default: 0, index: true }
})

// Trigger al crear like
async function createLike(senderId, receiverId) {
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    await Like.create([{ senderId, receiverId }], { session })
    
    // Incrementar contador
    await User.updateOne(
      { _id: receiverId },
      { $inc: { likesReceived: 1 } },
      { session }
    )
    
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  }
}

// Leaderboard rápido
async function getLeaderboard(limit = 10) {
  return await User.find({ isDeleted: false })
    .sort({ likesReceived: -1 })
    .limit(limit)
    .select('name avatar major likesReceived')
}
```

### **Edge Case 8: Timezone de Timestamps**
```
Solución:
- Almacenar todo en UTC
- Retornar en ISO 8601
- Frontend maneja timezone local

Código:
// Siempre usar Date.now() o new Date()
createdAt: new Date() // Almacena en UTC

// En respuesta
{
  createdAt: "2026-02-21T10:30:00.000Z" // ISO 8601
}

// Frontend parsea
new Date("2026-02-21T10:30:00.000Z") // Convierte a local
```

---

## 📊 MODELOS DE DATOS

### **User**
```javascript
{
  _id: ObjectId,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  name: { type: String, required: true },
  avatar: { type: String, default: 'default-avatar.jpg' },
  major: { type: String, required: true },
  year: { type: String, enum: ['Freshman', 'Sophomore', 'Junior', 'Senior'] },
  bio: { type: String, maxlength: 500 },
  interests: [{ type: String, maxlength: 50 }],
  likesReceived: { type: Number, default: 0, index: true }, // denormalizado
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
Index: { email: 1 }, unique: true
Index: { likesReceived: -1 }
Index: { isDeleted: 1 }
```

### **Like**
```javascript
{
  _id: ObjectId,
  senderId: { type: ObjectId, ref: 'User', required: true, index: true },
  receiverId: { type: ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}

// Indexes
Index: { senderId: 1, receiverId: 1 }, unique: true // CRÍTICO
Index: { receiverId: 1, createdAt: -1 } // Para likes received
Index: { senderId: 1, createdAt: -1 } // Para likes sent

// Constraints
Check: senderId != receiverId
```

### **Match**
```javascript
{
  _id: ObjectId,
  userA: { type: ObjectId, ref: 'User', required: true, index: true },
  userB: { type: ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
}

// Indexes
Index: { userA: 1, userB: 1 }, unique: true // CRÍTICO
Index: { userA: 1, createdAt: -1 }
Index: { userB: 1, createdAt: -1 }

// Constraints
Check: userA < userB // Siempre menor primero
```

### **Message**
```javascript
{
  _id: ObjectId,
  senderId: { type: ObjectId, ref: 'User', required: true, index: true },
  receiverId: { type: ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, maxlength: 1000 },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
}

// Indexes
Index: { senderId: 1, receiverId: 1, createdAt: -1 } // Conversación
Index: { receiverId: 1, read: 1 } // Mensajes no leídos
```

### **Post**
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true, maxlength: 1000 },
  imageUrl: String,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
}

// Indexes
Index: { createdAt: -1 } // Feed ordenado
Index: { userId: 1, createdAt: -1 }
```

### **Notification**
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['match'], required: true },
  matchedWithId: { type: ObjectId, ref: 'User', required: true },
  matchedWithName: String,
  matchedWithAvatar: String,
  matchId: { type: ObjectId, ref: 'Match' },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}

// Indexes
Index: { userId: 1, read: 1, createdAt: -1 }
Index: { userId: 1, matchId: 1 }, unique: true // No duplicados
```

---

## 🔐 SEGURIDAD

### **Autenticación**
- JWT con expiración 7 días
- Refresh token para renovación
- Hash de passwords con bcrypt (cost 12)
- Rate limiting en login (5 intentos / 15 min)

### **Autorización**
- Middleware requireAuth en todas las rutas
- Verificar ownership en updates
- Admin role para rutas /api/admin/*

### **Validación de Input**
- Sanitizar todo input del usuario
- Validar tipos, longitudes, formatos
- Prevenir SQL injection (usar ORM)
- Prevenir XSS (escapar HTML)

### **Rate Limiting**
```javascript
// General API
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requests
}))

// Likes
POST /api/likes: 20/min, 100/día

// Messages
POST /api/messages: 30/min

// Login
POST /api/auth/login: 5/15min
```

---

## 📈 PERFORMANCE

### **Caching**
- Redis para leaderboard (TTL 5 min)
- Redis para contadores de likes
- CDN para avatares e imágenes

### **Database**
- Indexes en todos los campos de búsqueda
- Denormalizar likesReceived en User
- Pagination en todas las listas
- Limit máximo 100 items

### **Queries Optimizadas**
```javascript
// Malo: N+1 queries
const posts = await Post.find()
for (let post of posts) {
  post.user = await User.findById(post.userId)
}

// Bueno: 1 query con populate
const posts = await Post.find()
  .populate('userId', 'name avatar major')
  .limit(20)
```

---

## 🚀 DEPLOY

### **Environment Variables**
```
DATABASE_URL=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=random-secret-here
AWS_S3_BUCKET=campus-circle-images
NODE_ENV=production
PORT=3000
```

### **Health Check**
```javascript
GET /health
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 123456
}
```

---

## 📝 RESUMEN DE PRIORIDADES

### **P0 (Crítico - Día 1)**
1. POST /api/auth/register
2. POST /api/auth/login
3. POST /api/likes (con validaciones)
4. GET /api/matches
5. POST /api/messages (con validación de match)
6. GET /api/messages/:userId

### **P1 (Alta - Semana 1)**
7. GET /api/users/explore
8. GET /api/likes/received
9. GET /api/rankings
10. GET /api/notifications
11. PUT /api/notifications/:id/read

### **P2 (Media - Semana 2)**
12. POST /api/posts
13. GET /api/posts
14. POST /api/posts/:id/like
15. GET /api/admin/stats

### **P3 (Baja - Backlog)**
16. POST /api/posts/:id/comment
17. PUT /api/users/:id
18. File upload para avatares

---

**Total Endpoints: 25+**
**Modelos de Datos: 6**
**Reglas Definitivas: 5**
**Invariantes Críticos: 6**
**Edge Cases Cubiertos: 8**
