import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

//const API_BASE = "http://localhost:5000";
//const API_BASE = "https://zenmaster.coydog-parore.ts.net/";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Resources() {
  const [stats, setStats] = useState(null);
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [diskData, setDiskData] = useState([]);
  const [netData, setNetData] = useState([]);
  const [gpuData, setGpuData] = useState([]);
  const [search, setSearch] = useState('');

  const prevNet = useRef({ sent: 0, recv: 0 });

  useEffect(() => {
    const socket = io(API_BASE, { transports: ['polling'] });

    socket.on('system_update', (data) => {
      setStats(data);

      setCpuData(prev => [...prev.slice(-29), { value: data.cpu_percent }]);
      setRamData(prev => [...prev.slice(-29), { value: data.ram_percent }]);
      setDiskData(prev => [...prev.slice(-29), { value: data.disk_percent }]);

      const netSent = (data.network.bytes_sent - prevNet.current.sent) / 1024;
      const netRecv = (data.network.bytes_recv - prevNet.current.recv) / 1024;
      prevNet.current = {
        sent: data.network.bytes_sent,
        recv: data.network.bytes_recv
      };
      setNetData(prev => [...prev.slice(-29), { sent: netSent, recv: netRecv }]);

      // For GPUs
      setGpuData(prev => {
        const newGpuData = [...prev];
        data.gpus.forEach((gpu, idx) => {
          if (!newGpuData[idx]) newGpuData[idx] = [];
          newGpuData[idx] = [...newGpuData[idx].slice(-29), {
            load: gpu.load * 100,
            mem: (gpu.memoryUsed / gpu.memoryTotal) * 100
          }];
        });
        return newGpuData;
      });
    });

    return () => socket.disconnect();
  }, []);

  const killProcess = (pid) => {
    const socket = io(API_BASE);
    socket.emit('terminate_process', { pid });
    socket.disconnect();
  };

  const restartProcess = (pid) => {
    const socket = io(API_BASE);
    socket.emit('restart_process', { pid });
    socket.disconnect();
  };

  if (!stats) return <div className="text-white p-8">Loading...</div>;

  const filteredProcesses = stats.processes.filter(proc =>
    proc.name.toLowerCase().includes(search.toLowerCase())
  );

  const chartBaseStyle = "bg-white/5 p-4 rounded-xl shadow-lg";

  return (
    <div className="w-[100vw] h-[100vh] bg-gradient-to-br from-black to-gray-900 text-white font-montserrat overflow-x-hidden overflow-y-auto scrollbar-hide">
      <header className="w-[100vw] h-[8vh] px-8 flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20 relative">
        <img src="/icons/arklogo.png" alt="Ark Logo" className="h-6" />
        <img src="/icons/ark.png" alt="Center Icon" className="w-20 h-13 absolute left-1/2 transform -translate-x-1/2" />
        <div className="flex gap-4 text-sm"><span>2d 4h</span></div>
      </header>

      <h1 className="text-3xl mb-6 ml-7 mt-6" style={{ fontFamily: 'Michroma, sans-serif' }}>SYSTEM RESOURCES</h1>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CPU */}
        <div className={chartBaseStyle}>
          <h2 className="mb-2">CPU Usage (%)</h2>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis hide />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#00D8FF" fill="#00D8FF" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RAM */}
        <div className={chartBaseStyle}>
          <h2 className="mb-2">RAM Usage (%)</h2>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={ramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis hide />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#FF5C93" fill="#FF5C93" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Disk */}
        <div className={chartBaseStyle}>
          <h2 className="mb-2">Disk Usage (%)</h2>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={diskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis hide />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#FFC93C" fill="#FFC93C" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Network */}
        <div className={chartBaseStyle}>
          <h2 className="mb-2">Network (KB/s)</h2>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={netData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis hide />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip />
              <Area type="monotone" dataKey="sent" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.3} />
              <Area type="monotone" dataKey="recv" stroke="#00B894" fill="#00B894" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-8 mb-8">
        <h1 className="text-3xl mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>GPUs</h1>
        {stats.gpus.length > 0 ? (
          stats.gpus.map((gpu, idx) => (
            <div key={idx} className="mb-4 bg-white/5 p-4 rounded-xl">
              <strong>{gpu.name}</strong>

              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={gpuData[idx]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis hide />
                  <YAxis tick={{ fill: '#ccc' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="load" stroke="#00FFA3" fill="#00FFA3" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="mem" stroke="#FF5C93" fill="#FF5C93" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="text-sm mt-2">
                Load: {gpu.load.toFixed(2)}% | Memory: {gpu.memoryUsed}MB / {gpu.memoryTotal}MB
              </div>
            </div>
          ))
        ) : (
          <p>No GPU detected</p>
        )}

        <h1 className="text-3xl mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>PROCESSES</h1>
        <input
          type="text"
          placeholder="Search processes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white w-full"
        />

        {/* Responsive Processes */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="p-2">PID</th>
                <th className="p-2">Name</th>
                <th className="p-2">CPU %</th>
                <th className="p-2">RAM %</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map(proc => (
                <tr key={proc.pid} className="hover:bg-white/10 transition">
                  <td className="p-2">{proc.pid}</td>
                  <td className="p-2 max-w-[200px] truncate" title={proc.name}>{proc.name}</td>
                  <td className="p-2">{proc.cpu.toFixed(1)}</td>
                  <td className="p-2">{proc.mem.toFixed(1)}</td>
                  <td className="p-2">
                    <button onClick={() => killProcess(proc.pid)} className="bg-red-500 px-2 py-1 rounded mr-2">Kill</button>
                    <button onClick={() => restartProcess(proc.pid)} className="bg-yellow-500 px-2 py-1 rounded">Restart</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile-friendly stacked cards */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredProcesses.map(proc => (
            <div key={proc.pid} className="bg-white/5 p-4 rounded-xl">
              <div className="text-sm mb-2">
                <strong>PID:</strong> {proc.pid}
              </div>
              <div className="text-sm mb-2 truncate" title={proc.name}>
                <strong>Name:</strong> {proc.name}
              </div>
              <div className="text-sm mb-2">
                <strong>CPU:</strong> {proc.cpu.toFixed(1)}%
              </div>
              <div className="text-sm mb-2">
                <strong>RAM:</strong> {proc.mem.toFixed(1)}%
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => killProcess(proc.pid)} className="bg-red-500 px-2 py-1 rounded text-xs">Kill</button>
                <button onClick={() => restartProcess(proc.pid)} className="bg-yellow-500 px-2 py-1 rounded text-xs">Restart</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
