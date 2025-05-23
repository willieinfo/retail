USE [FRDOI]
GO

/****** Object:  Table [dbo].[appusers]    Script Date: 05/23/2025 3:09:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[appusers](
	[UserCode] [char](4) NOT NULL,
	[UserName] [char](25) NULL,
	[NickName] [char](10) NULL,
	[Address_] [char](100) NULL,
	[Tel_Num_] [char](40) NULL,
	[Password] [char](10) NULL,
	[Position] [char](20) NULL,
	[Remarks_] [char](50) NULL,
	[EmailAdd] [char](50) NULL,
	[AvailMnu] [char](100) NULL,
	[MenuOpts] [char](100) NULL,
	[Disabled] [bit] NULL,
	[AutIncId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK__APPUSERS__1DF52D0D1FF18E38] PRIMARY KEY CLUSTERED 
(
	[UserCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_UserCode]  DEFAULT ('') FOR [UserCode]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_UserName]  DEFAULT ('') FOR [UserName]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_NickName]  DEFAULT ('') FOR [NickName]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_Address_]  DEFAULT ('') FOR [Address_]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_Tel_Num_]  DEFAULT ('') FOR [Tel_Num_]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_Password]  DEFAULT ('') FOR [Password]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_Position]  DEFAULT ('') FOR [Position]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_Remarks_]  DEFAULT ('') FOR [Remarks_]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_EmailAdd]  DEFAULT ('') FOR [EmailAdd]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_AvailMnu]  DEFAULT ('') FOR [AvailMnu]
GO

ALTER TABLE [dbo].[appusers] ADD  CONSTRAINT [DF_APPUSERS_MenuOpts]  DEFAULT ('') FOR [MenuOpts]
GO


