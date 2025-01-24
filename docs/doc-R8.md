# MoveAbsIncPosExExam

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
4. Operate the motor with incremental position by setting the acceleration/deceleration parameters.
5. Operate the motor with absolute position by setting the acceleration/deceleration structure variables.
6. Close connection.

[KR]  
1. 장치 연결.
2. 드라이브 에러 체크.
3. Servo Enable.
4. 가감속 파라미터 설정을 통한 모터 상대 위치 이동 동작 실시.
5. 가감속 구조체 변수 설정을 통한 모터 상대 위치 이동 동작 실시.
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

## 4. Move Increase position1
``` python
lIncPos = nDistance
lVelocity = 40000

# Move the motor by [nDistance] pulse (target position : Absolute position)
print("Move Motor! \n")

if FAS_MoveSingleAxisIncPos(nPortNo, iSlaveNo, lIncPos, lVelocity) != FMM_OK:
    print("Function(FAS_MoveSingleAxisIncPos) was failed.")
    return False
```
[EN]    
You can use the FAS_MoveSingleAxisIncPos() function to operate the motor with [incremental position, speed].

[KR]  
FAS_MoveSingleAxisIncPos() 함수를 사용하여 모터의 [상대 위치, 속도]으로 동작시킬 수 있습니다.

## 5. Move Increase position2
``` python
opt = MOTION_OPTION_EX(
        BIT_IGNOREEXSTOP=0,
        BIT_USE_CUSTOMACCEL=1,
        BIT_USE_CUSTOMDECEL=1,
        wCustomAccelTime=nAccDecTime,
        wCustomDecelTime=nAccDecTime
    )
    lIncPos = nDistance
    lVelocity = 40000

    print("Move Motor! [Ex]\n")

    if FAS_MoveSingleAxisIncPosEx(nPortNo, iSlaveNo, lIncPos, lVelocity, opt) != FMM_OK:
        print("Function(FAS_MoveSingleAxisIncPosEx) was failed.")
        return False
```
[EN]    
You can use the FAS_MoveSingleAxisIncPosEx() function to operate the motor with [incremental position, speed, acceleration/deceleration].

[KR]  
FAS_MoveSingleAxisIncPosEx() 함수를 사용하여 모터의 [상대 위치, 속도, 가감속]으로 동작시킬 수 있습니다.

### 5.1 Motion option
[EN]    
MOTION_OPTION_EX is a structure variable that can set the acceleration/deceleration time when the motor is operating. Information about the structure variable can be found in the define file (MOTION_DEFINE.py).

[KR]  
MOTION_OPTION_EX는 모터 동작시 가감속 시간을 설정할 수 있는 구조체 변수입니다. 구조체 변수에 대한 정보는 define파일(MOTION_DEFINE.py)에서 확인하실 수 있습니다.

## 6. Watch drive status
``` python
# Check the Axis status until motor stops and the Inposition value is checked
while True:
    time.sleep(0.001)
    status_result, axis_status = FAS_GetAxisStatus(nPortNo, iSlaveNo)
    if status_result != FMM_OK:
        print("Function(FAS_GetAxisStatus) was failed.")
        return False

    if (
        not axis_status & EZISERVO_AXISSTATUS.FFLAG_MOTIONING
        and axis_status & EZISERVO_AXISSTATUS.FFLAG_INPOSITION
    ):
        break
```
[EN]    
The FAS_GetAxisStatus() function indicates the drive status value.
The user can use it to check the status and wait until a specific status value is confirmed.
In addition, the user can check whether the motor operation is completed with the values ​​FFLAG_MOTIONING ('0') and FFLAG_INPOSITION ('1').

[KR]  
드라이브의 운전 상태값을 나타내는 FAS_GetAxisStatus() 함수를 사용하여 사용자가 원하는 특정상태 값이 확인 될 때까지 대기할 수 있습니다.
더하여 모터의 동작 후 정지완료 상태는 FFLAG_MOTIONING ('0') 및 FFLAG_INPOSITION('1') 값으로 확인 할 수 있습니다.

### 6.1 Axis status
[EN]    
EZISERVO_AXISSTATUS is a structure that organizes the drive status values ​​and can be checked in the define file (MOTION_EziSERVO_DEFINE.py). 
In addition, the stop completion status after motor operation can be checked with the FFLAG_MOTIONING ('0') and FFLAG_INPOSITION ('1') values.

[KR]  
EZISERVO_AXISSTATUS 는 드라이브 상태값이 정리된 구조체이며 define파일 (MOTION_EziSERVO_DEFINE.py)에서 확인하실 수 있습니다. 
더하여 모터의 동작 후 정지완료 상태는 FFLAG_MOTIONING ('0') 및 FFLAG_INPOSITION('1') 값으로 확인 할 수 있습니다.

## 7. Etc
[EN]    
1. For function descriptions on connecting and disconnecting devices, please refer to the [01.ConnectionExam] project document. 
2. For function descriptions on setting parameters, please refer to the [02.ParameterTestExam] project document.

[KR]  
1. 장치 연결 및 해제에 대한 함수 설명은 [01.ConnectionExam] 프로젝트 문서를 참고하시기 바랍니다.
2. 파라미터 설정에 대한 함수 설명은 [02.ParameterTestExam] 프로젝트 문서를 참고하시기 바랍니다.
