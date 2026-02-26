#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

// ADC pin for ZMPT101B (ESP32 ADC1_CH0 = GPIO34)
#define VOLTAGE_PIN 34

// Calibration constant: adjust after testing with known voltage
// Multiply the measured AC RMS (in volts) by this factor to get actual Vrms
float voltageCalibration = 312.0;   // TODO: calibrate with a multimeter

void setup() {
  Serial.begin(115200);
  // Set I2C pins for ESP32 (SDA=21, SCL=22) – adjust if your wiring differs
  Wire.begin(21, 22);

  if (!ina219.begin()) {
    Serial.println("INA219 not found");
    while (1);
  }

  analogReadResolution(12);          // ESP32 ADC is 12-bit (0-4095)
  Serial.println("ESP32 Power Analyzer Started");
}

/**
 * Reads the AC mains voltage using ZMPT101B.
 * Returns the RMS voltage in volts (after calibration).
 */
float readRMSVoltage() {
  const int samples = 500;            // Number of samples per measurement
  float raw[samples];                 // Store raw ADC voltages (with DC offset)
  float sum = 0;

  // 1. Read samples and compute sum for DC offset estimation
  for (int i = 0; i < samples; i++) {
    int adc = analogRead(VOLTAGE_PIN);
    raw[i] = (adc * 3.3f) / 4095.0f;  // Convert to voltage (0-3.3V)
    sum += raw[i];
    delayMicroseconds(200);            // ~5 kHz sampling rate
  }

  float offset = sum / samples;        // DC offset (~1.65V for AC signal centered at Vcc/2)

  // 2. Remove offset and accumulate squares of AC component
  float sumSquares = 0;
  for (int i = 0; i < samples; i++) {
    float ac = raw[i] - offset;        // AC component only
    sumSquares += ac * ac;
  }

  float rms_ac = sqrt(sumSquares / samples);   // AC RMS in volts (before calibration)
  return rms_ac * voltageCalibration;           // Apply calibration factor
}

void loop() {
  // Read current from INA219 (convert mA to A)
  float current_A = ina219.getCurrent_mA() / 1000.0;

  // Read AC RMS voltage
  float vrms = readRMSVoltage();

  // Calculate apparent power (assuming resistive load, i.e. power factor = 1)
  float power = vrms * current_A;

  // Output results
  Serial.print("Vrms: ");
  Serial.print(vrms, 2);
  Serial.print(" V | ");

  Serial.print("Current: ");
  Serial.print(current_A, 3);
  Serial.print(" A | ");

  Serial.print("Power: ");
  Serial.print(power, 2);
  Serial.println(" W");

  delay(1000);
}