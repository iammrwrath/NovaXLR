; NovaXLR Installation Script
; Built with Inno Setup 6

[Setup]
AppName=NovaXLR
AppVersion=1.2.8
WizardStyle=modern
DefaultDirName={autopf}\NovaXLR
DefaultGroupName=NovaXLR
UninstallDisplayIcon={app}\goxlr-daemon.exe
Compression=lzma2/ultra64
SolidCompression=yes
LicenseFile=..\LICENSE
OutputDir=..\ci\Output
OutputBaseFilename=NovaXLR-1.2.8
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
SetupIconFile=..\daemon\resources\goxlr-utility.ico
CloseApplications=force
CloseApplicationsFilter=*.exe
AppPublisher=iammrwrath
AppPublisherURL=https://github.com/iammrwrath/NovaXLR
PrivilegesRequired=admin

[Files]
Source: "..\target\release\goxlr-daemon.exe";             DestDir: "{app}";       DestName: "goxlr-daemon.exe"
Source: "..\target\release\goxlr-utility-ui.exe";        DestDir: "{app}";       DestName: "goxlr-utility-ui.exe"
Source: "..\target\release\goxlr-client.exe";             DestDir: "{app}";       DestName: "goxlr-client.exe"
Source: "..\target\release\goxlr-client-quiet.exe";       DestDir: "{app}";       DestName: "goxlr-client-quiet.exe"
Source: "..\target\release\goxlr-defaults.exe";           DestDir: "{app}";       DestName: "goxlr-defaults.exe"
Source: "..\target\release\goxlr-launcher.exe";           DestDir: "{app}";       DestName: "goxlr-launcher.exe"
Source: "..\target\release\SAAPI64.dll";                  DestDir: "{app}";       DestName: "SAAPI64.dll"
Source: "..\target\release\nvdaControllerClient64.dll";   DestDir: "{app}";       DestName: "nvdaControllerClient64.dll"
Source: "..\LICENSE";                                     DestDir: "{app}";       DestName: "LICENSE"
Source: "..\LICENSE-3RD-PARTY";                           DestDir: "{app}";       DestName: "LICENSE-3RD-PARTY"

[Tasks]
Name: StartOnLogin; Description: Automatically start NovaXLR on Login

[Icons]
Name: "{group}\NovaXLR"; Filename: "{app}\goxlr-launcher.exe";
Name: "{userstartup}\NovaXLR"; Filename: "{app}\goxlr-daemon.exe"; Tasks: StartOnLogin

[Run]
Filename: "{app}\goxlr-launcher.exe"; Description: "Run NovaXLR"; Flags: shellexec skipifsilent nowait postinstall;

[Code]
// Check to see if the GoXLR API is available before installing..
function InitializeSetup(): Boolean;
begin
    if (FileExists('C:/Program Files/TC-HELICON/GoXLR_Audio_Driver/W10_x64/goxlr_audioapi_x64.dll')) then
    begin
        Result := True
    end
    else
    begin
        MsgBox('Unable to locate the GoXLR Driver, please ensure it is installed to the default location.', mbCriticalError, MB_OK);
        Result := False
    end
end;

var
  SecondLicensePage: TOutputMsgMemoWizardPage;
  License2AcceptedRadio: TRadioButton;
  License2NotAcceptedRadio: TRadioButton;

procedure CheckLicense2Accepted(Sender: TObject);
begin
  WizardForm.NextButton.Enabled := License2AcceptedRadio.Checked;
end;

function CloneLicenseRadioButton(Source: TRadioButton): TRadioButton;
begin
  Result := TRadioButton.Create(WizardForm);
  Result.Parent := SecondLicensePage.Surface;
  Result.Caption := Source.Caption;
  Result.Left := Source.Left;
  Result.Top := Source.Top;
  Result.Width := Source.Width;
  Result.Height := Source.Height;
  Result.Anchors := Source.Anchors;
  Result.OnClick := @CheckLicense2Accepted;
end;

procedure InitializeWizard();
var
  LicenseFileName: string;
  LicenseFilePath: string;
begin
  SecondLicensePage :=
    CreateOutputMsgMemoPage(
      wpLicense, SetupMessage(msgWizardLicense), SetupMessage(msgLicenseLabel),
      SetupMessage(msgLicenseLabel3), '');

  SecondLicensePage.RichEditViewer.Height := WizardForm.LicenseMemo.Height;

  LicenseFileName := 'LICENSE-3RD-PARTY';
  ExtractTemporaryFile(LicenseFileName);
  LicenseFilePath := ExpandConstant('{tmp}\' + LicenseFileName);
  SecondLicensePage.RichEditViewer.Lines.LoadFromFile(LicenseFilePath);
  DeleteFile(LicenseFilePath);

  License2AcceptedRadio :=
    CloneLicenseRadioButton(WizardForm.LicenseAcceptedRadio);
  License2NotAcceptedRadio :=
    CloneLicenseRadioButton(WizardForm.LicenseNotAcceptedRadio);

  License2NotAcceptedRadio.Checked := True;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = SecondLicensePage.ID then
  begin
    CheckLicense2Accepted(nil);
  end;
end;
