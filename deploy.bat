@echo off
echo ====================================================
echo ��ѧ��Դ����ϵͳ - ����ű�
echo ====================================================
echo.

REM ���Node.js�Ƿ�װ
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ����: δ��⵽Node.js�����Ȱ�װNode.js
    echo �����Դ� https://nodejs.org ���ز���װ
    pause
    exit /b 1
)

REM ���npm�Ƿ�װ
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ����: δ��⵽npm����ȷ��Node.js��ȷ��װ
    pause
    exit /b 1
)

REM ��װ����
echo [1/4] ��װ��Ŀ����...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ��װ����ʧ�ܣ������������ӻ�Node.js�汾
    pause
    exit /b 1
)

REM ��ʼ������
echo [2/4] ��ʼ����Ŀ����...
node init-data.js
if %ERRORLEVEL% NEQ 0 (
    echo ��ʼ������ʧ��
    pause
    exit /b 1
)

REM ������Ŀ
echo [3/4] ������Ŀ...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ������Ŀʧ��
    pause
    exit /b 1
)

REM ������Ŀ
echo [4/4] ������Ŀ...
echo ��Ŀ���� http://localhost:3000 ����
echo Ĭ�Ϲ���Ա�˻�: admin
echo.
echo ��Ctrl+C����ֹͣ������
echo ====================================================
call npm start