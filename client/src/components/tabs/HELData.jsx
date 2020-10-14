import React from 'react'
import { VictoryBar, VictoryChart, VictoryAxis, VictoryLabel } from 'victory'
import Search from '../utils/Search'
import ItemList from '../utils/ItemList'
import * as TimeTableData from '../../Timetable.json'
import { useGetData } from 'use-axios-react'
import axios from 'axios'
import Card from '@material-ui/core/Card'
import { makeStyles } from '@material-ui/core'
const course = JSON.parse(JSON.stringify(TimeTableData)).default
const useStyles = makeStyles({
  card: {
    backgroundColor: '#ddd',
    margin: '1vh',
    height: '40vw',
  },
})
let courseData = []
let humCourses = Object.keys(course)
  .filter(
    (code) =>
      code.startsWith('GS') ||
      code.startsWith('HSS') ||
      code.startsWith('BITS F214') ||
      code.startsWith('BITS F385') ||
      code.startsWith('BITS F399')
  )
  .reduce((res, key) => {
    res[key] = course[key]
    return res
  }, {})
const HELData = () => {
  const [studentData, setStudentData] = React.useState({
    courseStats: [],
  })
  const { courseStats } = studentData
  let result = ''

  const HELstats = (e) => {
    e.preventDefault()
    let et = e.target.innerHTML.toLowerCase()
    let event = et.split(' ')
    event = event[0] + ' ' + event[1]

    try {
      axios.get(`/api/helData/searchHEL/${event}`).then((res) => {
        resp = true
        result = res.data.studentsInterestedInAllSlots

        let newCSarray = []
        if (result) {
          for (let i = 0; i < 8; i++) {
            newCSarray.push({ x: i + 1, y: result[i] })
          }
        }
        setStudentData({ ...studentData, courseStats: newCSarray })
      })
    } catch (err) {
      console.log('DB RETRIEVAL ERROR:', err)
    }
    if (courseStats.length === 0) return false
    courseData = et
    return true
  }

  function filterItems(input) {
    const userInput = input.target.value.toLowerCase()
    let courses = JSON.parse(JSON.stringify(TimeTableData)).default
    let filterCourses = (obj) =>
      Object.keys(obj)
        .filter(
          (item) =>
            item.toLowerCase().search(userInput) !== -1 ||
            obj[item]['name'].toLowerCase().search(userInput) !== -1
        )
        .filter(
          (code) =>
            code.startsWith('GS') ||
            code.startsWith('HSS') ||
            code.startsWith('BITS F214') ||
            code.startsWith('BITS F385') ||
            code.startsWith('BITS F399')
        )
        .reduce((res, key) => {
          res[key] = obj[key]
          return res
        }, {})
    humCourses = filterCourses(courses)
    setStudentData({ ...studentData }) //force component update
  }
  const classes = useStyles()
  let resp = true
  let str = [
    <div style={{ float: 'right', width: '35%' }}>
      <Card className={classes.card}>
        <Search action={filterItems} />
        <ItemList
          items={humCourses}
          action={(e) => {
            HELstats(e)
          }}
        />
      </Card>
    </div>,
  ]
  const [, loading] = useGetData('/api/heldata/searchHEL/:name')
  if (!loading) {
    if (resp === true && courseStats.length > 0) {
      let max = 0
      for (let i of courseStats) max = i['y'] > max ? i['y'] : max
      str.push([
        <div style={{ float: 'left', width: '64%' }}>
          <Card className={classes.card}>
            <VictoryChart domainPadding={10} animate={{ duration: 2000 }}>
              <VictoryAxis
                tickValues={[1, 2, 3, 4, 5, 6, 7, 8]}
                tickFormat={[
                  'Slot 1',
                  'Slot 2',
                  'Slot 3',
                  'Slot 4',
                  'Slot 5',
                  'Slot 6',
                  'Slot 7',
                  'Slot 8',
                ]}
              />
              <VictoryAxis
                dependentAxis
                tickCount={max < 3 ? 2 : 5}
                tickFormat={(x) => x}
              />
              <VictoryBar
                data={courseStats}
                labels={({ datum }) => {
                  if (datum.y > 0) return Math.round(datum.y)
                  else return null
                }}
                style={{ labels: { fill: 'black' } }}
                labelComponent={<VictoryLabel />}
              />
            </VictoryChart>
          </Card>
        </div>,
      ])
    } else if (resp === false || courseStats.length === 0) {
      str.push([
        <Card className={classes.card}>
          <div>
            <h3>No data available for this course!</h3>
          </div>
        </Card>,
      ])
    }
  } else {
    str.push([
      <Card className={classes.card}>
        <h3>LOADING....</h3>
      </Card>,
    ])
  }
  return <>{str}</>
}
export default HELData
