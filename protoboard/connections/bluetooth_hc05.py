# Imports
from machine import UART
from hardware import clear_oled

# UART Configuration for HC-05
uart = UART(0, baudrate=9600)
uart.init(9600, bits=8, parity=None, stop=1)

# Executes received command and sends status
def process_command(cmd):
    try:
        # Remove extra characters and run command
        cmd = cmd.strip()
        if cmd:
            exec(cmd)
            uart.write("OK\r\n")
    except Exception as e:
        # Send error message back
        error_msg = f"Error: {str(e)}\r\n"
        uart.write(error_msg.encode())

# Main loop: listens for incoming commands via Bluetooth/UART
def bluetooth_hc05():
    clear_oled()
    # State tracking: True if we are currently receiving data/connected
    is_connected = False
    
    # Initial status message
    print("System started. UART listening.")
    print("Waiting connection...")
    uart.write("System started\r\n")
    
    # Buffer to store multi-character commands
    buffer = ''
    
    while True:
        
        if uart.any(): # Command received
                
            # Read and process commands 
            try:
                # Read one character at a time
                char = uart.read(1).decode('utf-8')
                
                # If finds a new line, process the command
                if char in ('\n', '\r'):
                    if buffer.strip():
                        process_command(buffer)
                    buffer = ''
                else:
                    buffer += char
                    
            except Exception as e:
                # Handle unexpected read/decode errors
                print(f"UART Read Error: {e}")
                uart.write(f"Read Error: {str(e)}\r\n")
                buffer = ''
                

if __name__ == '__main__':
    bluetooth_hc05()
