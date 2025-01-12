-- Habilitar la extensión de almacenamiento si no está habilitada
create extension if not exists "storage" schema "storage";

-- Crear el bucket si no existe
insert into storage.buckets (id, name)
values ('comprobantes', 'comprobantes')
on conflict do nothing;

-- Política para permitir a los usuarios autenticados subir archivos
create policy "Usuarios autenticados pueden subir archivos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'comprobantes' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir a los usuarios autenticados leer sus propios archivos
create policy "Usuarios pueden leer sus propios archivos"
on storage.objects for select
to authenticated
using (
    bucket_id = 'comprobantes' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir a los usuarios autenticados actualizar sus propios archivos
create policy "Usuarios pueden actualizar sus propios archivos"
on storage.objects for update
to authenticated
using (
    bucket_id = 'comprobantes' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir a los usuarios autenticados eliminar sus propios archivos
create policy "Usuarios pueden eliminar sus propios archivos"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'comprobantes' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir acceso público a los archivos (opcional, solo si necesitas URLs públicas)
create policy "Acceso público a los archivos"
on storage.objects for select
to public
using (bucket_id = 'comprobantes');
