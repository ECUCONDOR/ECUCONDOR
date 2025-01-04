-- Crear un job para limpiar archivos antiguos cada día
select
  cron.schedule(
    'cleanup-old-files', -- nombre del job
    '0 0 * * *',        -- ejecutar a las 00:00 todos los días
    $$
    select storage.cleanup_old_files();
    $$
  );
