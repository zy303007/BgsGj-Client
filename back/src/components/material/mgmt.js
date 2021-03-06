import React, { Component } from 'react'
import { Table, Switch, Form, Input, Icon, Modal } from 'antd'
import common from '../../common'
import Util from '../util'
import './material.less'

class Mgmt extends Component {
  state = {
    data: [],
    pagination: { size: 'small', pageSize: 10, current: 1 },
    loading: false,
    gEnable: false,
  }
  columns = [
    { title: '分类', key: 'mamgmttype', dataIndex: 'type' },
    { title: '名称', key: 'mamgmtname', dataIndex: 'name' },
    { title: '数量', key: 'mamgmtquantity', dataIndex: 'quantity' },
    { title: '单价', key: 'mamgmtprice', dataIndex: 'price', render: i => '¥' + i },
  ]
  getExData = record => {
    const exData = [
      { key: 'type', index: '分类', type: 'text' },
      { key: 'name', index: '名称', type: 'text'  },
      { key: 'quantity', index: '数量', type: 'number' },
      { key: 'unit', index: '单位', type: 'text' },
      { key: 'price', index: '单价', type: 'number' },
    ].map(obj => {
      return {
        key: `${record._id}${obj.key}`,
        index: obj.index,
        text: <Util.EditableCell type={obj.type} value={record[obj.key] || '无'}
          onCheck={value => 
            common.handle(common.api.putMaterials({ _id: record._id, [obj.key]: value }),
              () => record[obj.key] = value,
              this.setState.bind(this))}
        />,
      }
    })
    exData.push({
      key: `${record._id}enable`, index: '启用',
      text: <div className='mgmt-opts'>
        <Switch checked={record.enable} size='small'
          onChange={checked =>
            common.handle(common.api.putMaterials({ _id: record._id, enable: checked }),
              () => record.enable = checked,
              this.setState.bind(this))
        }/>
        <Icon type='delete' className='delete'
          onClick={() => this.handleDelete(record)}/>
      </div>,
    })
    return exData
  }
  getFormItems = getFieldDecorator => [
    { key: 'type', label: '分类', type: 'text', icon: 'book' },
    { key: 'name', label: '名称', type: 'text', icon: 'form'  },
    { key: 'quantity', label: '数量', type: 'number', icon: 'calculator'  },
    { key: 'unit', label: '单位', type: 'text', icon: 'inbox'  },
    { key: 'price', label: '单价', type: 'number', icon: 'pay-circle-o'  },
  ].map(obj => 
    <Form.Item key={`${obj.key}new`}>
      {
        getFieldDecorator(obj.key, {
          rules: [{ required: true, message: `请输入${obj.label}` }],
        })(<Input type={obj.type} prefix={<Icon type={obj.icon} style={{fontSize: 13}}/>} placeholder={obj.label}/>)
      }
    </Form.Item>
  )
  handleCreate = (material, done) => common.handle(common.api.postMaterials(material), done)
  handleDelete = record => {
    Modal.confirm({
      title: `确定删除${record.name}？`,
      content: `分类为${record.type}，数量为${record.quantity}${record.unit}，单价为￥${record.price}。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => 
        common.handle(common.api.delMaterials({ _id: record._id }), () => {
          const { pagination } = this.state
          common.handle(common.api.getMaterials({
            skip: pagination.pageSize * (pagination.current - 1),
            limit: pagination.pageSize,
          }), res => {
            const { total, list } = res.body
            const pager = { ...pagination }
            pager.total = total
            this.setState({
              data: list,
              pagination: pager,
            })
          }, this.setState.bind(this))
        }, this.setState.bind(this))
      },
    );
  }
  componentDidMount() {
    common.handle(common.api.getMaterials({ settings: true }), res => {
      const { gEnable } = res.body
      this.setState({ gEnable })
    }, this.setState.bind(this))
  }
  render() {
    return (
      <div className='material'>
        <Table
          pagination={false}
          showHeader={false}
          className='mgmt-table'
          loading={this.state.loading}
          columns={[
            { title: '', key: 'index', dataIndex: 'index' },
            { title: '', key: 'text', dataIndex: 'text' },
          ]}
          dataSource={[
            { key: `mamgmtenable`, index: '物资借用', text: <Switch checked={this.state.gEnable}
              onChange={gEnable => {
                common.handle(common.api.putMaterials({ gEnable }),
                  () => this.setState({ gEnable },
                  this.setState.bind(this)))
              }}/> },
          ]}
        />
        <Util.List 
          state={this.state}
          setState={this.setState.bind(this)}
          columns={this.columns}
          getExData={this.getExData}
          api={common.api.getMaterials}
          new={{btnText: '新建物资', layout: 'vertical', onCreate: this.handleCreate, getFormItems: this.getFormItems}}
        />
      </div>
    )
  }
}

export default Mgmt
