# 📦 Sistema de Gestión de Inventario Tecnológico

Un sistema completo para gestionar inventario de equipos tecnológicos, empleados, tickets de soporte y más.

## 🚀 Características

- ✅ **Gestión de Equipos** - Laptops, desktops, monitores, impresoras
- 👥 **Gestión de Empleados** - Información completa del personal
- 🎫 **Sistema de Tickets** - Mesa de ayuda con seguimiento
- 🤖 **Asistente IA** - Consultas técnicas con Google AI
- 🏢 **Estaciones de Servicio** - Ubicaciones de soporte
- 🔐 **Autenticación** - Sistema seguro con Supabase

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **UI:** shadcn/ui, Radix UI
- **IA:** Google Generative AI
- **Autenticación:** Supabase Auth

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta en Supabase
- Cuenta en Google AI Studio (opcional)

## 🚀 Instalación

1. **Clonar el repositorio:**
   \`\`\`bash
   git clone https://github.com/tu-usuario/inventory-system.git
   cd inventory-system
   \`\`\`

2. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar variables de entorno:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. **Configurar Supabase:**
   - Crear proyecto en [supabase.com](https://supabase.com)
   - Ejecutar scripts SQL en \`scripts/\`
   - Agregar credenciales a \`.env.local\`

5. **Ejecutar en desarrollo:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🗄️ Base de Datos

Ejecutar los scripts SQL en orden:

1. \`01-create-tables-fixed.sql\` - Crear tablas principales
2. \`02-setup-auth-simple.sql\` - Configurar autenticación
3. \`03-sample-data-fixed.sql\` - Datos de ejemplo
4. \`05-create-ticket-comments-table.sql\` - Tabla de comentarios

## 👤 Usuarios de Prueba

- **Admin:** admin@empresa.com / admin123
- **Manager:** manager@empresa.com / manager123
- **User:** user@empresa.com / user123

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno
3. Deploy automático

### Netlify
1. Conectar repositorio en [netlify.com](https://netlify.com)
2. Build command: \`npm run build\`
3. Publish directory: \`.next\`

## 📝 Variables de Entorno

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_supabase
GOOGLE_AI_API_KEY=tu_clave_google_ai
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (\`git checkout -b feature/nueva-funcionalidad\`)
3. Commit cambios (\`git commit -m 'Agregar nueva funcionalidad'\`)
4. Push a la rama (\`git push origin feature/nueva-funcionalidad\`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)
