-- INSERT Trigger
CREATE TRIGGER trg_SALESDTL_INSERT
ON SALESDTL
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO itemledg (
        Location, TableNme, CtrlNum_, RecordId, ItemCode,
        DateTran, Quantity, LandCost
    )
    SELECT
        sr.Location,
        'SALESDTL',
        i.CtrlNum_,
        CAST(i.RecordId AS CHAR(12)),
        i.ItemCode,
        sr.DateFrom,
        -i.Quantity,
        i.LandCost
    FROM INSERTED i
    JOIN SALESREC sr ON i.CtrlNum_ = sr.CtrlNum_;
END
GO

-- DELETE Trigger
CREATE TRIGGER trg_SALESDTL_DELETE
ON SALESDTL
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM itemledg
    WHERE TableNme = 'SALESDTL'
      AND RecordId IN (
          SELECT CAST(RecordId AS CHAR(12)) FROM DELETED
      );
END
GO

-- UPDATE Trigger
CREATE TRIGGER trg_SALESDTL_UPDATE
ON SALESDTL
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE il
    SET
        il.Location = sr.Location,
        il.CtrlNum_ = i.CtrlNum_,
        il.ItemCode = i.ItemCode,
        il.DateTran = sr.DateFrom,   -- Use SALESREC.DateFrom
        il.Quantity = -i.Quantity,   -- Stock goes out
        il.LandCost = i.LandCost
    FROM itemledg il
    JOIN INSERTED i ON il.RecordId = CAST(i.RecordId AS CHAR(12))
    JOIN SALESREC sr ON i.CtrlNum_ = sr.CtrlNum_
    WHERE il.TableNme = 'SALESDTL';
END
GO
