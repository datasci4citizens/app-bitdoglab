import time
import gc
from machine import Pin
import neopixel

print("Initializating BitDogLab")

# Imports hardware
print("Loading hardware...")
from hardware import (
    update_oled, clear_oled,
    clear_neopixels,
    joy_up,joy_down, button_a, button_b,
    led,
    play_tone
)

# Imports connection modules
print("Loading connection modules...")
from connections.bluetooth_hc05 import bluetooth_hc05
from connections.wifi import wifi

# Imports snake game
print("Loading snake game...")
from games.snake_game import snake_start

print("=" * 40)

# Menu
MENU_OPTIONS = [
    {
        "name": "Modulo HC-05",
        "func": bluetooth_hc05
    },
    {
        "name": "WiFi",
        "func": wifi
    },
    {
        "name": "Jogo Snake",
        "func": snake_start
    }
]

# Show menu on OLED Display
def show_menu(selected_index):
    option = MENU_OPTIONS[selected_index]
    
    # Setups OLED lines
    lines = [
        "== MENU ==",
        "",
        f"> {option['name']}",
        "",
        "",
        "",
        "Joy: Navegar",
        "A: Selecionar"
    ]
    
    update_oled(lines)

# Startup animation
def show_startup_animation():

    clear_oled()
    update_oled([
        "",
        "  BitDogLab",
        "  Pico 2W",
        "",
        "  Pronto!",
    ])
    
    import time
    time.sleep(1)
    
    clear_oled()

# Manage the selection and navigation menu
def main():
    
    print("Starting menu...")
    
    # Show up the startup animation
    show_startup_animation()
    
    # Selected option index
    selected = 0
    
    # Show up the initial menu
    show_menu(selected)
    
    # Variables for buttons debounce
    last_up = False
    last_down = False
    last_button_a = False
    
    print("Menu active, use joystick to navigate")
    
    try:
        while True:
            # Joystick navigation
            
            current_up = joy_up()
            if current_up and not last_up:
                selected = (selected - 1) % len(MENU_OPTIONS)
                show_menu(selected)
                time.sleep(0.2)  # Debounce
            last_up = current_up

            current_down = joy_down()
            if current_down and not last_down:
                selected = (selected + 1) % len(MENU_OPTIONS)
                show_menu(selected)
                time.sleep(0.2)  # Debounce
            last_down = current_down
            
            # Selection with button(A)
            current_button_a = button_a.value() == 0
            if current_button_a and not last_button_a:
                option = MENU_OPTIONS[selected]
                
                print(f"Selected option: {option['name']}")
                
                # Show transition screen
                update_oled([
                    "Iniciando:",
                    "",
                    option['name'],
                    "",
                    "Aguarde..."
                ])
                
                time.sleep(1)
                
                # Runs the selected option
                try:
                    option['func']()
                except Exception as e:
                    print(f"Error on run: {option['name']}: {e}")
                    update_oled([
                        "ERRO!",
                        "",
                        option['name'],
                        "falhou:",
                        "",
                        str(e)[:16],
                        str(e)[16:32] if len(str(e)) > 16 else ""
                    ])
                    play_tone(200, 0.5)
                    time.sleep(3)
                
                # Back to menu
                print("Going back to menu...")
                rgb_off()
                led.off()
                show_menu(selected)
                play_tone(1000, 0.05)
                
                # Clear memory
                gc.collect()
                
                time.sleep(0.3)  # Debounce
                
            last_button_a = current_button_a
            
            # Short pause to not overcharge
            time.sleep(0.01)
            
    except KeyboardInterrupt:
        rgb_off()
        led.off()
        clear_oled()
    except Exception as e:
        print(f"Fatal error on menu: {e}")
        update_oled([
            "ERRO FATAL!",
            "",
            str(e)[:16],
            str(e)[16:32] if len(str(e)) > 16 else ""
        ])
        
        # Error led
        for _ in range(10):
            led.toggle()
            time.sleep(0.1)

        
        raise

# Execution
if __name__ == "__main__":
    main()

