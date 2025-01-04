-- Crear el bucket si no existe
insert into storage.buckets (id, name)
values ('uploads', 'uploads')
on conflict (id) do nothing;

-- Política para subir archivos (solo usuarios autenticados)
create policy "Usuarios autenticados pueden subir archivos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = 'comprobantes'
  and auth.uid() = owner
);

-- Política para ver archivos (solo el propietario)
create policy "Usuarios pueden ver sus propios archivos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'uploads'
  and owner = auth.uid()
);

-- Política para eliminar archivos (solo el propietario)
create policy "Usuarios pueden eliminar sus propios archivos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'uploads'
  and owner = auth.uid()
);

-- Función para limpiar archivos antiguos (más de 30 días)
create or replace function storage.cleanup_old_files()
returns void
language plpgsql
security definer
as $$
begin
  delete from storage.objects
  where
    bucket_id = 'uploads'
    and created_at < now() - interval '30 days';
end;
$$;
