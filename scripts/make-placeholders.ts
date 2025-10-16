// scripts/make-placeholders.ts
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/synth-faces');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1x1 white JPEG (base64)
const b64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhISEhIVFhUVFRUVFRUVFRUVFRUXFhUVFRUYHSggGBolHRUVITEhJSorLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBEQACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADQQAAEDAgQDBgUEAwAAAAAAAAEAAgMEEQUSITZBURMiYXGBkQYUMkJSobHR8CMzgpLw/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAECAwQF/8QAHREBAAMBAQEBAQAAAAAAAAAAAAECEQMSITFBUf/aAAwDAQACEQMRAD8A+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//2Q==';

const buf = Buffer.from(b64, 'base64');
const placeholder = path.join(outDir, 'placeholder.jpg');
fs.writeFileSync(placeholder, buf);

// Make p-001.jpg ... p-035.jpg
for (let i = 1; i <= 35; i++) {
  const id = `p-${String(i).padStart(3, '0')}.jpg`;
  fs.copyFileSync(placeholder, path.join(outDir, id));
}
console.log('✅ Created placeholder.jpg and 35 copies in public/synth-faces/');
