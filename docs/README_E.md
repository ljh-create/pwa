# Python PE Library

Plus-E 파이썬 라이브러리      
C++ dll을 포팅해 파이썬에 맞게 API 및 구조체를 수정했습니다.

# 지원 버전

c++ dll을 파이썬에서 사용할 수 있도록 하는 ctypes 모듈이 사용되었기에 ctypes를 지원하는 파이썬 버전 2.5부터 사용이 가능합니다.        
예제파일은 파이썬 2.x 와 3.x의 Print문을 비롯한 차이가 있어 파이썬 버전 3.0부터 실행이 가능하며 원할한 실행을 위해선 파이썬 3.7 이상이 권장됩니다.

# 특이 사항

1. 기존 c++ dll을 기반으로 작성되었기 때문에 라이브러리를 사용할 때 해당 dll이 라이브러리 폴더 내부에 존재해야 합니다. 만약 라이브러리 폴더 외부에 dll파일이 위치할 경우 dll파일의 경로를 설정해주어야 합니다. 해당 방법은 예제파일의 경로 설정 방법을 참고하여 진행하시면 됩니다.

2. 파이썬은 코드 실행의 리턴값을 튜플을 이용해 여러 개 가질 수 있습니다. 따라서 기존 C++과 달리 리턴 코드를 포함한 여러 개의 리턴값을 반환하는 코드가 존재합니다. 

3. c++의 union과 enum과 동일한 형태가 파이썬에는 없어 유사한 구현을 해두었습니다.

4. FAS_SetLogPath와 같이 인자값으로 문자열을 사용하는 API의 경우 파이썬 2.x와 3.x의 문자열 인코딩 방식이 달라 별도의 함수를 통해 API에 각각 맞는 데이터타입을 전달하도록 구현이 되어있습니다.


# 파이썬 API차이

파이썬은 c++과 달리 POINTER가 존재하지 않고 리턴값을 튜플을 이용해 여러 개를 가질 수 있기에 기존 매뉴얼의 API와는 인자와 리턴값에 차이가 존재합니다.     


## Plus-E

FAS_IsBdIDExist     
\> Board의 ID번호 입력하면 리턴 코드와 IP주소를 튜플로서 반환        
FAS_IsIPAddressExist        
\> IP주소 입력하면 리턴 코드와 Board의 ID번호를 튜플로서 반환        
FAS_GetEthernetAddr     
\> Board의 ID번호 입력하면 리턴 코드와 게이트웨이, 서브넷, ip를 튜플로서 반환       
FAS_GetMACAddress       
\> Board의 ID번호 입력하면 리턴 코드와 Mac주소를 튜플로서 반환       
FAS_GetSlaveInfo        
\> Board의 ID번호 입력하면 리턴 코드와 드라이브 종류, 프로그램 Version을 튜플로서 반환    
FAS_GetMotorInfo        
\> Board의 ID번호 입력하면 리턴 코드와 연결된 모터의 종류, 제조사에 대한 정보를 튜플로서 반환    
FAS_GetSlaveInfoEx      
\> Board의 ID번호 입력하면 리턴 코드와 DRIVE_INFO 구조체를 통한 정보가 튜플로서 반환     
FAS_GetParameter        
\> Board의 ID번호, 파라미터 번호 입력하면 리턴 코드와 지정한 Parameter 값을 RAM영역에서 가져와 튜플로서 반환     
FAS_GetROMParameter     
\> Board의 ID번호, 파라미터 번호 입력하면 리턴 코드와 지정한 Parameter 값을 ROM영역에서 가져와 튜플로서 반환  
FAS_GetIOInput      
\> Board의 ID번호 입력하면 리턴 코드와 제어 입력단의 현재 입력 신호 상태를 튜플로서 반환        
FAS_GetIOOutput     
\> Board의 ID번호 입력하면 리턴 코드와 제어 입력단의 현재 출력 신호 상태를 튜플로서 반환        
FAS_GetIOAssignMap      
\> Board의 ID번호, I/O Pin번호 입력하면 리턴 코드와 CN 1 단자대 pin 설정상태를 튜플로서 반환        
FAS_GetAxisStatus       
\> Board의 ID번호 입력하면 리턴 코드와 드라이브 운전 상태 flag 값이 튜플로서 반환        
FAS_GetIOAxisStatus     
\> Board의 ID번호 입력하면 리턴 코드와 제어 입출력상태, 운전 상태 flag 값이 튜플로서 반환        
FAS_GetMotionStatus     
\> Board의 ID번호 입력하면 리턴 코드와 운전 진행 상황, 운전 중인 PT 번호를 튜플로서 반환        
FAS_GetAllStatus       
\> Board의 ID번호 입력하면 리턴 코드와 현재 상태를 모두 튜플로서 반환         
FAS_GetCommandPos       
\> Board의 ID번호 입력하면 리턴 코드와 현재 목표 위치값을 튜플로서 반환     
FAS_GetActualPos        
\> Board의 ID번호 입력하면 리턴 코드와 현재 실제 위치값을 튜플로서 반환     
FAS_GetPosError     
\> Board의 ID번호 입력하면 리턴 코드와 현재 실제 위치값과 목표위치값의 차이를 튜플로서 반환     
FAS_GetActualVel        
\> Board의 ID번호 입력하면 리턴 코드와 현재 이동 중인 운전의 실제 운전 속도 값을 튜플로서 반환     
FAS_GetAlarmType        
\> Board의 ID번호 입력하면 리턴 코드와 현재 알람의 발생 여부 및 알람의 종류를 튜플로서 반환     
FAS_TriggerOutput_Status        
\> Board의 ID번호 입력하면 리턴 코드와 출력신호(COMP)의 발생 여부를 튜플로서 반환     
FAS_GetTriggerOutputEx      
\> Board의 ID번호와 출력번호 입력하면 리턴 코드와 리스트로 된 출력신호(COMP)의 자세한 사항을 튜플로서 반환     
FAS_GetPushStatus       
\> Board의 ID번호 입력하면 리턴 코드와 현재의 push motion의 상태를 튜플로서 반환     
FAS_PosTableReadItem        
\> Board의 ID번호와 item번호 입력하면 리턴 코드와 특정 포지션테이블의 RAM영역의 값들을 튜플로서 반환     
FAS_PosTableReadOneItem     
\> Board의 ID번호와 item번호, 항목의 위치 offset값 입력하면 리턴 코드와 특정 포지션테이블의 특정 항목의 RAM영역의 값들을 튜플로서 반환     
FAS_GetAlarmLogs        
\> Board의 ID번호 입력하면 리턴 코드와 드라이브의 알람 기록 목록을 튜플로서 반환     
FAS_GetInput        
\> Board의 ID번호 입력하면 리턴 코드와 Input/Latch 상태를 튜플로서 반환      
FAS_GetLatchCount       
\> Board의 ID번호와 latch 번호 입력하면 리턴 코드와 해당 비트의 Latch Count를 튜플로서 반환      
FAS_GetLatchCountAll        
\> Board의 ID번호 입력하면 리턴 코드와 Latch Count(0\~15CH) 전체를 튜플로서 반환   
FAS_GetLatchCountAll32      
\> Board의 ID번호 입력하면 리턴 코드와 Latch Count(0\~31CH) 전체를 튜플로서 반환   
FAS_GetOutput       
\> Board의 ID번호 입력하면 리턴 코드와 Output과 Trigger(Run or Stop)를 튜플로서 반환     
FAS_GetTriggerCount     
\> Board의 ID번호와 Output번호 입력하면 리턴 코드와 선택한 번호의 Triffer 횟수를 튜플로서 반환       
FAS_GetIOLevel      
\> Board의 ID번호 입력하면 리턴 코드와 Input or Output Active Level을 튜플로서 반환      
FAS_SetADConfig     
\> Board의 ID번호와 CH 선택 번호, 파라미터 번호, 설정할 값 입력하면 리턴 코드와 적용된 값을 튜플로서 반환        
FAS_GetADConfig     
\> Board의 ID번호와 CH 선택 번호, 파라미터 번호 입력하면 리턴 코드와 A/D변환 파라미터 값을 튜플로서 반환        
FAS_ReadADValue     
\> Board의 ID번호와 CH 선택 번호 입력하면 리턴 코드와 A/D변환 값을 튜플로서 반환        
FAS_ReadADAllValue      
\> Board의 ID번호와 8개 CH offset 입력하면 리턴 코드와 8개 A/D 변환값을 튜플로서 반환    
FAS_SetDACConfig        
\> Board의 ID번호와 CH 선택 번호, 파라미터 번호, 설정할 값 입력하면 리턴 코드와 적용된 값을 튜플로서 반환        
FAS_GetDACConfig        
\> Board의 ID번호와 CH 선택 번호, 파라미터 번호 입력하면 리턴 코드와 DAC변환 파라미터 값을 튜플로서 반환        
FAS_GetDACValue     
\> Board의 ID번호와 CH 선택 번호 입력하면 리턴 코드와 DAC변환 값을 튜플로서 반환        
