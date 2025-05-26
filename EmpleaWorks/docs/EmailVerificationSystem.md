# Sistema de Verificación de Email - EmpleaWorks

## Descripción General

Este sistema implementa verificación de email obligatoria para acciones sensibles en la aplicación. Cuando un usuario intenta realizar ciertas acciones (editar perfil, cambiar contraseña, guardar ofertas, aplicar a ofertas), la app verifica automáticamente si su email está verificado.

## Componentes Principales

### 1. Funciones de API (`api/axios.js`)

```javascript
// Verificar estado de verificación del email
getEmailVerificationStatus()

// Reenviar email de verificación
resendEmailVerification()

// Verificar si se requiere verificación para una acción
checkEmailVerificationRequired()

// Manejar errores de verificación de email desde respuestas de API
handleEmailVerificationError(error)
```

### 2. Hook Personalizado (`hooks/useEmailVerification.ts`)

```typescript
// Hook principal para verificación de email
const { verificationState, isChecking, checkVerification, handleApiError } = useEmailVerification();

// Hook con protección automática
const { verificationState, checkBeforeAction } = useEmailVerificationGuard();
```

### 3. Componente de Pantalla (`components/EmailVerificationScreen.tsx`)

Pantalla moderna que se muestra cuando se requiere verificación:
- Instrucciones claras para el usuario
- Botón para reenviar email de verificación
- Opción para volver atrás
- Diseño responsive y accesible

### 4. Wrapper de Protección (`components/EmailVerificationGuard.tsx`)

```typescript
// Wrapper para componentes completos
<EmailVerificationGuard actionName="editar perfil">
  <YourComponent />
</EmailVerificationGuard>

// Wrapper para botones específicos
<VerificationRequiredButton onPress={handleAction} actionName="guardar oferta">
  <TouchableOpacity>
    <Text>Guardar Oferta</Text>
  </TouchableOpacity>
</VerificationRequiredButton>
```

## Implementación en Pantallas

### Método 1: Verificación Manual (Implementado)

```typescript
import { useEmailVerificationGuard } from '@/hooks/useEmailVerification';
import EmailVerificationScreen from '@/components/EmailVerificationScreen';

const MyScreen = () => {
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { verificationState, checkBeforeAction } = useEmailVerificationGuard();

  const handleAction = async () => {
    const result = await checkBeforeAction('realizar esta acción');
    
    if (result.needsVerification) {
      setShowEmailVerification(true);
      return;
    }
    
    // Proceder con la acción
    doAction();
  };

  return (
    <View>
      {/* Tu contenido */}
      
      <Modal visible={showEmailVerification}>
        <EmailVerificationScreen
          email={verificationState?.email}
          onGoBack={() => setShowEmailVerification(false)}
          onVerificationSent={() => {/* opcional */}}
        />
      </Modal>
    </View>
  );
};
```

### Método 2: Usando Wrapper (Alternativo)

```typescript
import { VerificationRequiredButton } from '@/components/EmailVerificationGuard';

const MyScreen = () => {
  const handleSaveOffer = () => {
    // Esta función solo se ejecuta si el email está verificado
    saveOffer();
  };

  return (
    <VerificationRequiredButton 
      onPress={handleSaveOffer} 
      actionName="guardar oferta"
    >
      <TouchableOpacity style={styles.saveButton}>
        <Text>Guardar Oferta</Text>
      </TouchableOpacity>
    </VerificationRequiredButton>
  );
};
```

## Pantallas Implementadas

### ✅ edit-profile.tsx
- **Acción Protegida**: Actualizar perfil
- **Verificación**: Antes de `handleSave()`
- **UX**: Modal de verificación

### ✅ change-password.tsx  
- **Acción Protegida**: Cambiar contraseña
- **Verificación**: Antes de `handleSubmit()`
- **UX**: Modal de verificación

### ✅ ApplyForm.tsx
- **Acción Protegida**: Aplicar a oferta
- **Verificación**: Antes de `handleSubmit()`
- **UX**: Modal de verificación

## Flujo de Usuario

1. **Usuario intenta realizar acción protegida**
   - Editar perfil
   - Cambiar contraseña  
   - Aplicar a oferta
   - Guardar oferta

2. **Sistema verifica automáticamente**
   - Consulta estado de verificación del email
   - Si está verificado → Permite la acción
   - Si no está verificado → Muestra pantalla de verificación

3. **Pantalla de verificación**
   - Explica que se requiere verificación
   - Muestra el email del usuario
   - Ofrece reenviar email de verificación
   - Permite volver atrás

4. **Después de verificar**
   - Usuario verifica email en su correo
   - Regresa a la app
   - Puede realizar la acción sin restricciones

## Testing

### Probador en TestApi.js

```javascript
// Botones de prueba disponibles:
"Test Sistema Verificación Email"     // Prueba las funciones de API
"Test Wrapper Verificación Completo"  // Prueba el sistema completo
```

### Comandos de Testing Backend

```bash
# Para marcar email como verificado en desarrollo
php artisan tinker
User::where('email', 'email@test.com')->update(['email_verified_at' => now()]);
```

## Beneficios

1. **Seguridad**: Asegura que solo usuarios con email verificado realicen acciones importantes
2. **UX Consistente**: Misma experiencia en todas las pantallas
3. **Mantenible**: Código reutilizable y fácil de mantener
4. **Flexible**: Fácil de agregar a nuevas pantallas
5. **Debugging**: Logs detallados para troubleshooting

## Próximos Pasos

1. **Implementar en más pantallas**:
   - Pantalla de ofertas guardadas
   - Creación de ofertas (empresas)
   - Configuraciones de perfil

2. **Mejoras de UX**:
   - Notificaciones push cuando se verifica el email
   - Auto-refresh después de verificación
   - Indicador de progreso durante verificación

3. **Features adicionales**:
   - Recordatorios automáticos de verificación
   - Diferentes niveles de verificación
   - Verificación por SMS como alternativa

## Troubleshooting

### Error: "Cannot find module"
- Verificar que todas las importaciones usen rutas correctas
- Verificar que los archivos TypeScript estén en las carpetas correctas

### Modal no aparece
- Verificar que `showEmailVerification` state esté funcionando
- Verificar que `Modal` esté importado de 'react-native'

### Verificación no funciona
- Verificar logs en consola para errores de API
- Usar botones de prueba en TestApi.js para diagnosticar
- Verificar que el backend tenga los endpoints necesarios

## Estructura de Archivos

```
├── api/
│   └── axios.js                     # Funciones de API
├── hooks/
│   └── useEmailVerification.ts      # Hooks personalizados
├── components/
│   ├── EmailVerificationScreen.tsx  # Pantalla de verificación
│   └── EmailVerificationGuard.tsx   # Wrappers de protección
└── app/
    ├── edit-profile.tsx             # ✅ Implementado
    ├── change-password.tsx          # ✅ Implementado
    └── ApplyForm.tsx                # ✅ Implementado
```
