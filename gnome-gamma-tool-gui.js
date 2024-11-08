// src/main.ts
imports.gi.versions.Gtk = "4.0";
var Gtk = imports.gi.Gtk;
var GLib = imports.gi.GLib;
var utf8decoder = new TextDecoder();
function debounce(callback, delay) {
  let timeout = null;
  return function(...args) {
    if (timeout) {
      GLib.source_remove(timeout);
      timeout = null;
    }
    timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
      callback(...args);
      timeout = null;
      return GLib.SOURCE_REMOVE;
    });
  };
}
function applyProfile(brightness, temperature) {
  const cmdStr = `./gnome-gamma-tool/gnome-gamma-tool.py -b ${brightness.toFixed(2)} -t ${temperature} -y`;
  print(cmdStr);
  const [success, stdout, _stderr, exit_status] = GLib.spawn_command_line_sync(
    cmdStr
  );
  if (success && stdout) {
    print("Command output:\n" + utf8decoder.decode(stdout));
  } else {
    print("Command failed with exit status: " + exit_status);
  }
}
var app = new Gtk.Application();
app.connect("activate", (app2) => {
  const window = new Gtk.ApplicationWindow({
    application: app2,
    title: "gnome-gamma-tool-gui"
  });
  const formBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL
  });
  const brightnessBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL
  });
  const brightnessLabel = new Gtk.Label({ label: "Brightness:" });
  const brightnessSlider = new Gtk.Scale({
    orientation: Gtk.Orientation.HORIZONTAL,
    adjustment: new Gtk.Adjustment({
      lower: 10,
      upper: 100,
      step_increment: 1,
      page_increment: 10,
      page_size: 0,
      value: 100
    }),
    round_digits: 0,
    draw_value: true,
    value_pos: Gtk.PositionType.BOTTOM,
    digits: 0,
    hexpand: true
  });
  const temperatureBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL
  });
  const temperatureLabel = new Gtk.Label({ label: "Temperature:" });
  const temperatureSlider = new Gtk.Scale({
    orientation: Gtk.Orientation.HORIZONTAL,
    adjustment: new Gtk.Adjustment({
      lower: 1500,
      upper: 6500,
      step_increment: 1,
      page_increment: 10,
      page_size: 0,
      value: 6500
    }),
    round_digits: 0,
    draw_value: true,
    value_pos: Gtk.PositionType.BOTTOM,
    digits: 0,
    hexpand: true
  });
  const onChange = debounce(() => {
    applyProfile(
      brightnessSlider.get_value() / 100,
      temperatureSlider.get_value()
    );
  }, 200);
  brightnessSlider.connect("value-changed", onChange);
  temperatureSlider.connect("value-changed", onChange);
  window.set_child(formBox);
  formBox.append(brightnessBox);
  brightnessBox.append(brightnessLabel);
  brightnessBox.append(brightnessSlider);
  formBox.append(temperatureBox);
  temperatureBox.append(temperatureLabel);
  temperatureBox.append(temperatureSlider);
  window.present();
});
app.run([]);
