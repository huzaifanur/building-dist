const express = require('express')
const app = express()
var cors = require('cors')
app.use(express.json())
app.use(cors())
const mongoose = require('mongoose')
const port = 3000

// Enter Your MongoDB URL here
mongoose.connect('mongodb://localhost/test', () => {
  console.log('Connected to MongoDB')
})
// {{ Schema & Model
const buldingSchema = new mongoose.Schema({
  x: Number,
  y: Number,
})
const Building = mongoose.model('Building', buldingSchema)

// }}

// Route  to add a new building
// app.post('/api/building', async function (req, res) {
//   const building = new Building(req.body)
//   try {
//     building.save()
//     res.status(200).send(building)
//   } catch (error) {
//     console.log(error)
//     res.status(500).send(error)
//   }
// })

app.get('/api/building/:id', async (req, res) => {
  const id = req.params.id
  try {
    const nearest = await fetchDataAndReturnNearest(id)
    res.status(200).send(nearest)
  } catch (error) {
    res.send(error?.message)
  }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function fetchDataAndReturnNearest(id) {
  const buildings = await Building.find()
  let mainbuilding = {}
  let secBuildings = []
  for (let i = 0; i < buildings.length; i++) {
    if (buildings[i]._id == id) {
      mainbuilding = buildings[i]
    } else {
      secBuildings.push(buildings[i])
    }
  }
  return getNearest(mainbuilding, secBuildings)
}

function getNearest(main, others) {
  let d1 = calculateDistance(main, others[0])
  let d2 = calculateDistance(main, others[1])
  if (d1 < d2) {
    return others[0]
  } else {
    return others[1]
  }
}

function calculateDistance(main, secondary) {
  const lat1 = parseFloat(main.x)
  const lon1 = parseFloat(main.y)
  const lat2 = parseFloat(secondary.x)
  const lon2 = parseFloat(secondary.y)
  const R = 6371e3 // metres
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c // in metres
  return d
}
