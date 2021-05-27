{
  "id": "set_regulator",
  "title": {
    "en": "Set Regulator %",
    "no": "Sett Regulator %"
  },
  "args": [
    {
      "name": "device",
      "type": "device",
      "filter": "driver_id=ESHSUPERTR&capabilities=dim"
    },
    {
      "name": "data_fetch_interval",
      "type": "number",
      "min": 1,
      "max": 100,
      "step": 1.0,
      "label": "%",
      "title": {
        "en": "Regulator %",
        "no": "Regulator %"
      },
      "placeholder": {
        "en": "Regulator %",
        "no": "Regulator %"
      }
    }
  ]
}
