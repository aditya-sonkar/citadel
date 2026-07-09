import React, { useState } from 'react';
import { useAttachPolicy } from '../../hooks/useUsers';
import { usePolicies } from '../../hooks/usePolicies';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import type { IAMTab } from './Sidebar';

interface CreateUserWizardProps {
  setActiveTab: (tab: IAMTab) => void;
}

const CreateUserWizard: React.FC<CreateUserWizardProps> = ({ setActiveTab }) => {
  const queryClient = useQueryClient();
  const attachPolicyMutation = useAttachPolicy();
  const { data: policies, isLoading: loadingPolicies } = usePolicies();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [policySearch, setPolicySearch] = useState('');
  
  // Validation errors
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('A valid email address is required.');
        return;
      }
      if (password && !passwordRegex.test(password)) {
        setError('Password must be 8+ characters and include uppercase, lowercase, number, and special character.');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    let createdUserId: string | null = null;
    try {
      setError('');
      setIsSubmitting(true);
      // Call auth/register to create the user (spec: POST /api/auth/register)
      const { data } = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password: password || 'TempPass123!',
      });
      const newUser = data.data?.user || data.data;
      if (newUser?.id) {
        createdUserId = newUser.id;
      }

      // Invalidate users list so the new user appears immediately
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Attach selected policies sequentially
      if (newUser?.id) {
        for (const policyId of selectedPolicies) {
          await attachPolicyMutation.mutateAsync({
            userId: newUser.id,
            policyId: policyId
          });
        }
      }

      // Return to users list on success
      setActiveTab('users');
    } catch (err: any) {
      // Rollback: if user was registered but policy attachment failed, delete the user
      if (createdUserId) {
        try {
          await api.delete(`/iam/users/${createdUserId}`);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (cleanupErr) {
          console.error('Failed to cleanup user after policy attachment failure', cleanupErr);
        }
      }
      setError(err.response?.data?.message || 'Failed to create user. Please check your inputs.');
      setIsSubmitting(false);
    }
  };

  const togglePolicySelection = (id: string) => {
    setSelectedPolicies(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-full animate-fade-in bg-zinc-50 dark:bg-[#050505] text-zinc-600 dark:text-zinc-300 font-sans">
      
      {/* Left Sidebar Steps */}
      <div className="w-[260px] border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-8 shrink-0 bg-white dark:bg-[#000000]">
        <div className="flex flex-col gap-1 relative">
          
          <div className="absolute left-3 top-4 bottom-4 w-[2px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Step 1 */}
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2.5px] mt-0.5 ${
              step >= 1 ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-[#000000] text-blue-600 dark:text-blue-500' : 'border-zinc-300 dark:border-zinc-600 bg-transparent text-zinc-400 dark:text-zinc-600'
            }`}>
              {step > 1 ? (
                <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              ) : (
                <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${step >= 1 ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>Step 1</span>
              <span className={`text-[14px] font-medium ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-600'}`}>Specify user details</span>
            </div>
          </div>

          <div className="h-6"></div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2.5px] mt-0.5 ${
              step >= 2 ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-[#000000] text-blue-600 dark:text-blue-500' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#000000] text-zinc-400 dark:text-zinc-600'
            }`}>
              {step > 2 ? (
                <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              ) : step === 2 ? (
                <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${step >= 2 ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>Step 2</span>
              <span className={`text-[14px] font-medium ${step === 2 ? 'text-blue-600 dark:text-blue-400' : step > 2 ? 'text-zinc-900 dark:text-zinc-300' : 'text-zinc-500 dark:text-zinc-600'}`}>Set permissions</span>
            </div>
          </div>

          <div className="h-6"></div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[2.5px] mt-0.5 ${
              step >= 3 ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-[#000000] text-blue-600 dark:text-blue-500' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#000000] text-zinc-400 dark:text-zinc-600'
            }`}>
              {step === 3 && (
                <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${step >= 3 ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>Step 3</span>
              <span className={`text-[14px] font-medium ${step === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-600'}`}>Review and create</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#050505] p-8 overflow-y-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-6">
          {step === 1 && 'Specify user details'}
          {step === 2 && 'Set permissions'}
          {step === 3 && 'Review and create'}
        </h1>

        <div className="max-w-[800px] flex-1 flex flex-col gap-6 pb-20">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-red-600 dark:text-red-400 text-[13px]">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">User details</h2>
              </div>
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-zinc-900 dark:text-white">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="w-full h-[36px] px-3 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-zinc-900 dark:text-white">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="w-full h-[36px] px-3 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">Must be a valid email address. Used to log in to the console.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-zinc-900 dark:text-white">Password</label>
                  <div className="relative w-[360px]">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full h-[36px] px-3 pr-10 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder-zinc-400 dark:placeholder-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Must be 8+ chars with uppercase, lowercase, number, and special character.</p>
                </div>

                <div className="p-4 border border-blue-200 dark:border-blue-800/50 rounded-md bg-blue-50 dark:bg-blue-900/10 flex items-start gap-3 mt-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">The new user will be able to log in with these credentials immediately. Assign policies in the next step to grant access to resources.</p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Permissions options</h2>
              </div>
              <div className="p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-3">
                  <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Permissions policies</h3>
                  
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white dark:bg-[#0a0a0a]">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50 dark:bg-[#0a0a0a]">
                      <div className="relative w-full max-w-[300px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search policies" value={policySearch} onChange={e => setPolicySearch(e.target.value)} className="w-full h-[32px] pl-9 pr-3 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded text-[13px] text-zinc-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left text-[13px]">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                          <tr>
                            <th className="p-3 w-10"></th>
                            <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">Policy name</th>
                            <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">Type</th>
                            <th className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {loadingPolicies && <tr><td colSpan={4} className="p-4 text-center text-zinc-500">Loading...</td></tr>}
                          {policies?.filter(p =>
                              p.name.toLowerCase().includes(policySearch.toLowerCase()) ||
                              (p.description && p.description.toLowerCase().includes(policySearch.toLowerCase()))
                            ).map(p => (
                            <tr key={p.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/30 cursor-pointer ${selectedPolicies.includes(p.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onClick={() => togglePolicySelection(p.id)}>
                              <td className="p-3">
                                <input type="checkbox" checked={selectedPolicies.includes(p.id)} readOnly className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-blue-600 dark:text-blue-500 focus:ring-0" />
                              </td>
                              <td className="p-3 text-blue-600 dark:text-blue-400 hover:underline font-medium">{p.name}</td>
                              <td className="p-3 text-zinc-500 dark:text-zinc-400">{p.type === 'SYSTEM' ? 'System managed' : 'Customer managed'}</td>
                              <td className="p-3 text-zinc-500 dark:text-zinc-400 truncate max-w-[300px]">{p.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{selectedPolicies.length} policies selected</p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">User details</h2>
                  <button onClick={() => setStep(1)} className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-[200px_1fr] gap-4 text-[13px]">
                    <div className="text-zinc-500 dark:text-zinc-400 font-medium">Full name</div>
                    <div className="text-zinc-900 dark:text-white">{name}</div>
                    
                    <div className="text-zinc-500 dark:text-zinc-400 font-medium">Email address</div>
                    <div className="text-zinc-900 dark:text-white">{email}</div>
                    
                    <div className="text-zinc-500 dark:text-zinc-400 font-medium">Console password</div>
                    <div className="text-zinc-900 dark:text-white">{password ? 'Custom password' : 'Auto-generated (TempPass123!)'}</div>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Permissions boundary</h2>
                  <button onClick={() => setStep(2)} className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                </div>
                <div className="p-6 text-[13px] text-zinc-500 dark:text-zinc-400">
                  Permissions boundary is not set.
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                  <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Permissions summary</h2>
                  <button onClick={() => setStep(2)} className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                </div>
                <div className="p-6">
                  {selectedPolicies.length === 0 ? (
                    <div className="text-[13px] text-zinc-500 dark:text-zinc-400">No permissions selected. User will have no access.</div>
                  ) : (
                    <ul className="list-disc pl-5 text-[13px] text-zinc-900 dark:text-white flex flex-col gap-2">
                      {selectedPolicies.map(id => {
                        const pol = policies?.find(p => p.id === id);
                        return <li key={id}>{pol?.name}</li>;
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-[260px] right-0 h-[64px] bg-white dark:bg-[#000000] border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end px-8 gap-4 z-50">
        {step === 1 ? (
          <button
            key="cancel-button"
            onClick={() => setActiveTab('users')}
            className="px-4 py-1.5 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors border border-transparent"
          >
            Cancel
          </button>
        ) : (
          <button
            key="prev-button"
            onClick={handleBack}
            className="px-4 py-1.5 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors border border-transparent"
          >
            Previous
          </button>
        )}

        {step === 3 ? (
          <button
            key="create-button"
            onClick={handleCreate}
            disabled={isSubmitting || attachPolicyMutation.isPending}
            className="px-5 py-1.5 text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting || attachPolicyMutation.isPending ? 'Creating...' : 'Create user'}
          </button>
        ) : (
          <button
            key="next-button"
            onClick={handleNext}
            className="px-5 py-1.5 text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Next
          </button>
        )}
      </div>

    </div>
  );
};

export default CreateUserWizard;
