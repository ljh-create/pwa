# JogMovementExam

Notification before use
-------------------------------------------------------
Depending on the type of product you are using, the definitions of 'Parameter', 'IO Logic', 'AxisStatus', etc. may be different.
This example is based on 'Ezi-SERVO', so please apply the appropriate value depending on the product you are using.
```
Example)	

FM_EZISERVO_PARAM			// Parameter enum when using 'Ezi-SERVO'	
FM_EZIMOTIONLINK_PARAM		// Parameter enum when using 'Ezi-MOTIONLINK'
```
[EN]    
This example code is implemented to run on Python 3.x and later.
If you use version 3.0 or less, you need to change the print and input functions.

[KR]  
이 예제코드는 파이썬 3.x이상에서 동작하도록 구현되어있습니다.
3.0이하 버전에서 사용하실경우 print, input함수의 변형이 필요합니다.

## 0. Program scenario
[EN]    
1. Connect a device.
2. Check the drive error.
3. Enable Servo.
4. Operate the motor clockwise for a certain period of time (5 seconds) and then stops.
5. Operate the motor counterclockwise for a certain period of time (5 seconds) and then stops.
6. Close connection.

[KR]  
1. 장치 연결.
2. 드라이브 에러 체크.
3. Servo Enable.
4. 일정 시간동안(5초) 시계방향으로 모터 동작후 정지.
5. 일정 시간동안(5초) 반시계방향으로 모터 동작후 정지.
6. 연결 해제.

## 1. Setting the Path
```python
import sys
import os
import platform
try:
    include_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
except NameError:
    include_path = os.path.abspath(
        os.path.join(os.getcwd(), "..")
    )

arch = platform.architecture()[0]
if arch == '64bit':
    library_path = os.path.join(include_path, "Include_Python_x64")
else:
    library_path = os.path.join(include_path, "Include_Python")

sys.path.append(library_path)
```
[EN]    
This code adds the appropriate Library folder path according to the Python architecture to import FAS_EziMOTIONPlusE, MOTION_DEFINE, and ReturnCodes_Define modules.
If the Library folder is in a different path, enter that path in Library_path.

[KR]  
FAS_EziMOTIONPlusE, MOTION_DEFINE, ReturnCodes_Define 모듈들을 Import 하기 위하여 파이썬 아키텍쳐에 따라 알맞은 Library 폴더 경로를 추가하는 코드입니다.
Library 폴더가 다른 경로에 있는 경우, library_path에 해당 경로를 입력해 주시기 바랍니다.

## 2. Check drive error
``` python
# Check Drive's Error
status_result, axis_status = FAS_GetAxisStatus(nPortNo, iSlaveNo)

if status_result != FMM_OK:
    print("Function(FAS_GetAxisStatus) was failed.")
    return False

if axis_status & EZISERVO_AXISSTATUS.FFLAG_ERRORALL:
    # if Drive's Error was detected, Reset the ServoAlarm
    if FAS_ServoAlarmReset(nPortNo, iSlaveNo) != FMM_OK:
        print("Function(FAS_ServoAlarmReset) was failed.")
        return False
```
[EN]    
You can check the current drive's operating status using the FAS_GetAxisStatus() function. You can reset the current drive's alarm status using the FAS_ServoAlarmReset() function.

[KR]  
FAS_GetAxisStatus() 함수를 사용하여 현재 드라이브의 운전 상태를 확인 할 수 있습니다. FAS_ServoAlarmReset() 함수를 사용하여 현재 드라이브의 알람상태를 리셋 할 수 있습니다.

### 2.1 Axis status
[EN]    
EZISERVO_AXISSTATUS is a structure that organizes drive status values.
It can be checked in the define file (MOTION_EziSERVO_DEFINE.py).

[KR]  
EZISERVO_AXISSTATUS 는 드라이브 상태값이 정리된 구조체이며 define파일 (MOTION_EziSERVO_DEFINE.py)에서 확인하실 수 있습니다.

## 3. Servo Enable
``` python
if FAS_ServoEnable(nPortNo, iSlaveNo, 1) != FMM_OK:
        print("Function(FAS_ServoEnable) was failed.")
        return False
```
[EN]    
You can set the Servo Enable signal of the drive using the FAS_ServoEnable() function.

[KR]  
FAS_ServoEnable() 함수를 사용하여 드라이브의 Servo Enable 신호를 설정할 수 있습니다.

## 4. Watch drive status
``` python
while (
        axis_status & EZISERVO_AXISSTATUS.FFLAG_SERVOON
    ) == 0:  # Wait until FFLAG_SERVOON is ON
        time.sleep(0.001)

        status_result, axis_status = FAS_GetAxisStatus(nPortNo, iSlaveNo)
        if status_result != FMM_OK:
            print("Function(FAS_GetAxisStatus) was failed.")
            return False

        if (axis_status & EZISERVO_AXISSTATUS.FFLAG_SERVOON) != 0:
            print("Servo ON")
```
[EN]    
The FAS_GetAxisStatus() function indicates the drive status value.
The user can use it to check the status and wait until a specific status value is confirmed.

[KR]  
드라이브의 운전 상태값을 나타내는 FAS_GetAxisStatus() 함수를 사용하여 사용자가 원하는 특정상태 값이 확인 될 때까지 대기할 수 있습니다.

## 5. Motor motion test
``` python
nTargetVeloc = 10000
nDirect = nDir

CW = 1
CCW = 0

if FAS_MoveVelocity(nPortNo, iSlaveNo, nTargetVeloc, nDirect) != FMM_OK:
    print("Function(FAS_MoveVelocity) was failed.")
    return False
```
[EN]    
The FAS_MoveVelocity() function allows the user to operate the motor at the desired [speed, direction].

[KR]  
FAS_MoveVelocity() 함수를 사용하여 사용자가 원하는 모터의 [속도, 방향]으로 동작할 수 있습니다.

## 6. Stop motor
``` python
if FAS_MoveStop(nPortNo, iSlaveNo) != FMM_OK:
    print("Function(FAS_MoveStop) was failed.")
    return False
```
[EN]    
You can stop a running motor using the FAS_MoveStop() function.

[KR]  
FAS_MoveStop() 함수를 사용하여 동작중인 모터를 정지 할 수 있습니다.

## 7. Etc
[EN]    
1. Please refer to the [01.ConnectionExam] project document for description of functions related to connecting and disconnecting devices.

[KR]  
1. 장치 연결 및 해제에 관한 기능 설명은 [01.ConnectionExam] 프로젝트 문서를 참고하시기 바랍니다.