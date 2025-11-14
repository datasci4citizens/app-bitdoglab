# Imports
import network
import socket
import time
import gc

# Import all hardware components for exec() commands and feedback
from hardware import (
    led, update_oled, clear_oled
)

# Network configuration
AP_SSID = "BDL #001"  # Network name
AP_PASSWORD = "BDL001"    # Network password (min 8 chars)
AP_IP = "192.168.4.1"        # Pico's static IP
TCP_PORT = 8080

# Creates an Acess Point (Pico becomes a router)
def create_access_point():    
    print("Creating Access Point...")
    
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid=AP_SSID, password=AP_PASSWORD)
    ap.ifconfig((AP_IP, '255.255.255.0', AP_IP, AP_IP))
    
    # Wait for AP to become active (with LED feedback)
    timeout = 10
    start = time.time()
    while not ap.active():
        if time.time() - start > timeout:
            print("AP creation timeout.")
            return None
        led.toggle()
        time.sleep(0.3)
    
    led.on()
    print(f"AP created. IP: {AP_IP}")
    
    return AP_IP

# Executes received command via TCP and sends status
def process_tcp_command(command, client_socket):
    
    command = command.strip()
    if not command:
        return
    
    try:
        exec(command)
        response = "OK\n"
        client_socket.send(response.encode())
    except Exception as e:
        error_msg = f"ERROR: {str(e)}\n"
        try:
            client_socket.send(error_msg.encode())
        except:
            pass # Failed to send error

# Main TCP server loop. Waits for connections and process commands
def tcp_server(ip):    
    print(f"Starting TCP server on {ip}:{TCP_PORT}")
    
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('0.0.0.0', TCP_PORT))
    server_socket.listen(1)
    
    print("Server listening. Ready for app connection.")
    
    while True:
        try:
            client_socket, client_address = server_socket.accept()
            print(f"Client connected: {client_address}")
            update_oled([
                "",
                "---------------",
                "Conexao Wifi",
                "Recebida!",
                "---------------",
                "",
                ""
            ])
            time.sleep(2)
            clear_oled()

            # Connection feedback (LED blink)
            for _ in range(2): led.off(); time.sleep(0.1); led.on(); time.sleep(0.1)
            
            client_socket.settimeout(30)
            buffer = ""
            
            try:
                while True:
                    data = client_socket.recv(1024)
                    if not data:
                        print("Client disconnected.")
                        update_oled([
                            "",
                            "---------------",
                            "Conexao Wifi",
                            "Perdida!",
                            "---------------",
                            "",
                            ""
                        ])
                        time.sleep(2)
                        update_oled([
                            "Conexao WiFi",
                            "-------------------",
                            
                            f"Rede: {AP_SSID}",
                            f"Senha: {AP_PASSWORD}",
                            f"------------------",
                            "Aguardando",
                            "Conexao..."
                        ])
                        break
                    
                    text = data.decode('utf-8', 'ignore')
                    
                    for char in text:
                        if char in ('\n', '\r'):
                            if buffer.strip():
                                process_tcp_command(buffer, client_socket)
                            buffer = ""
                        else:
                            buffer += char
            
            except socket.timeout:
                print("Connection timeout.")
            except Exception as e:
                print(f"Communication error: {e}")
            finally:
                client_socket.close()
                print(f"Connection closed: {client_address}")
                
                # Disconnection feedback (LED blink)
                for _ in range(3): led.off(); time.sleep(0.2); led.on(); time.sleep(0.2)
                gc.collect()
                
        except Exception as e:
            print(f"Server error: {e}")
            time.sleep(1)


# Main function for WiFi connection, sets up AP and starts TCP server
def wifi():
    
    # 1. Update OLED status (creating network)
    update_oled([
        "Conexao WiFi",
        "",
        "Criando rede:",
        AP_SSID[:16],
        "",
        "Aguardando..."
    ])
    
    # 2. Create Access Point
    ip = create_access_point()
    if not ip:
        # Error handling
        update_oled(["Erro!", "", "Falha ao criar rede.", "Tente novamente."])
        time.sleep(5); led.off()
        return
    
    # 3. Success Feedback
    update_oled([
        "Conexao WiFi",
        "-------------------",
        f"Rede: {AP_SSID}",
        f"Senha: {AP_PASSWORD}",
        f"------------------",
        "Aguardando",
        "Conexao..."
    ])
    
    print(f"SSID: {AP_SSID}| PSSWD: {AP_PASSWORD} | IP: {ip} | Port: {TCP_PORT}")
    
    try:
        # 4. Start TCP server
        tcp_server(ip)
    except Exception as e:
        # Fatal error handling
        print(f"Fatal error: {e}")
        update_oled(["FATAL TCP ERROR!", "", str(e)[:16], str(e)[16:32]])
        time.sleep(3)
        for _ in range(10): led.toggle(); time.sleep(0.1)
        led.off()

if __name__  == '__main__':
    wifi()
