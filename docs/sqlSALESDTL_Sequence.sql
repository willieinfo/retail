DECLARE @NextStart BIGINT;
SELECT @NextStart = ISNULL(MAX(AutIncId), 0) + 1 FROM SALESDTL;

DECLARE @sql NVARCHAR(MAX);
SET @sql = '
    CREATE SEQUENCE dbo.Seq_SALESDTL
    START WITH ' + CAST(@NextStart AS NVARCHAR) + '
    INCREMENT BY 1;
';
EXEC(@sql);