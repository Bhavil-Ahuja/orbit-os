@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@echo off
title %0
if "%MAVEN_BATCH_ECHO%" == "on" echo %MAVEN_BATCH_ECHO%

if "%HOME%" == "" set "HOME=%HOMEDRIVE%%HOMEPATH%"

set ERROR_CODE=0

if "%JAVA_HOME%" == "" (
  echo Error: JAVA_HOME not found in your environment. >&2
  goto error
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo Error: JAVA_HOME is set to an invalid directory. >&2
  goto error
)

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if "%MAVEN_PROJECTBASEDIR%"=="" (
  set EXEC_DIR=%CD%
  set WDIR=%EXEC_DIR%
:findBaseDir
  if exist "%WDIR%\.mvn" goto baseDirFound
  cd ..
  if "%WDIR%"=="%CD%" goto baseDirNotFound
  set WDIR=%CD%
  goto findBaseDir
:baseDirFound
  set MAVEN_PROJECTBASEDIR=%WDIR%
  cd "%EXEC_DIR%"
  goto endDetectBaseDir
:baseDirNotFound
  set MAVEN_PROJECTBASEDIR=%EXEC_DIR%
  cd "%EXEC_DIR%"
:endDetectBaseDir
)

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if not exist %WRAPPER_JAR% (
  set WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar
  for /f "usebackq tokens=1,2 delims==" %%A in ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") do (
    if "%%A"=="wrapperUrl" set WRAPPER_URL=%%B
  )
  powershell -Command "&{[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')}"
)

set MAVEN_CMD_LINE_ARGS=%*

"%JAVA_HOME%\bin\java.exe" ^
  %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
exit /B %ERROR_CODE%
