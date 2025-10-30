<template>
    <div class="page-content">
        <!-- Header Section -->
        <div class="page-info flex justify-between items-center p-4 bg-transparent">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <ol class="breadcrumb flex items-center list-none m-0 p-0 gap-2">
                    <li class="breadcrumb-item flex items-center text-gray-400">
                        <a href="#" class="breadcrumb-link text-blue-600 hover:text-blue-700">Customers</a>
                    </li>
                    <li class="breadcrumb-item active text-gray-400" aria-current="page">Manage</li>
                </ol>
            </nav>
            <div class="page-options flex items-center gap-4">
                <div class="relative">
                    <button
                        @click="showExportDropdown = !showExportDropdown"
                        class="btn btn-secondary rounded-lg px-4 py-2 hover:bg-gray-500 flex items-center"
                    >
                        <span class="material-icons-outlined">download</span>
                        Export
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    
                    <!-- Export Dropdown -->
                    <div
                        v-if="showExportDropdown"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                    >
                        <div class="py-1">
                            <button
                                @click="exportCustomersData('csv'); showExportDropdown = false"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export as CSV
                            </button>
                            <button
                                @click="exportCustomersData('pdf'); showExportDropdown = false"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </div>
                <button @click="showAddForm = true" class="btn btn-primary bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">
                    <span class="material-icons-outlined">add_circle</span> 
                    {{ t('Customer.Add') }}
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <section class="container px-4 mx-auto">
                <!-- Stats Card -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.total_customers') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.length }}</h3>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-blue-600 text-xl">
                                    people
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.active') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => c.is_active).length }}</h3>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-green-600 text-xl">
                                    check_circle
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.inactive') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => !c.is_active).length }}</h3>
                            </div>
                            <div class="bg-red-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-red-600 text-xl">
                                    cancel
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg shadow p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm">{{ t('Customer.with_email') }}</p>
                                <h3 class="text-2xl font-bold">{{ customers.filter(c => !!c.email).length }}</h3>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <span class="material-icons-outlined text-purple-600 text-xl">
                                    mail
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Search and Filters -->
                <div class="bg-transparent rounded-lg shadow p-4 mb-6">
                    <!-- Search Bar -->
                    <div class="mb-4">
                        <div class="relative">
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search customers by name, email, phone, address, city, country, or tax number..."
                                class="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                @keydown="handleSearchKeydown"
                            >
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <button
                                v-if="searchQuery"
                                @click="searchQuery = ''"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Filter Controls -->
                    <div class="flex flex-wrap items-center gap-4">
                        <!-- Advanced Filters Toggle -->
                        <button
                            @click="showAdvancedFilters = !showAdvancedFilters"
                            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                            </svg>
                            Advanced Filters
                            <span v-if="activeFiltersCount > 0" class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {{ activeFiltersCount }}
                            </span>
                        </button>

                        <!-- Clear All Filters -->
                        <button
                            v-if="activeFiltersCount > 0 || searchQuery"
                            @click="clearAllFilters"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Clear All
                        </button>

                        <!-- Results Counter -->
                        <div class="text-sm text-gray-600">
                            Showing {{ filteredCustomers.length }} of {{ customers.length }} customers
                        </div>
                    </div>

                    <!-- Advanced Filters Panel -->
                    <div v-if="showAdvancedFilters" class="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- Status Filter -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    v-model="statusFilter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <!-- City Filter -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <select
                                    v-model="cityFilter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Cities</option>
                                    <option v-for="city in uniqueCities" :key="city" :value="city">
                                        {{ city }}
                                    </option>
                                </select>
                            </div>

                            <!-- Country Filter -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <select
                                    v-model="countryFilter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Countries</option>
                                    <option v-for="country in uniqueCountries" :key="country" :value="country">
                                        {{ country }}
                                    </option>
                                </select>
                            </div>

                            <!-- Sales Range Filter -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Sales Count</label>
                                <select
                                    v-model="salesRangeFilter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Sales Counts</option>
                                    <option value="none">No Sales</option>
                                    <option value="low">1-5 Sales</option>
                                    <option value="medium">6-20 Sales</option>
                                    <option value="high">21-50 Sales</option>
                                    <option value="vip">50+ Sales</option>
                                </select>
                            </div>

                            <!-- Amount Range Filter -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                                <select
                                    v-model="amountRangeFilter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Amounts</option>
                                    <option value="none">No Purchases</option>
                                    <option value="low">Under $100</option>
                                    <option value="medium">$100 - $500</option>
                                    <option value="high">$500 - $1000</option>
                                    <option value="vip">Over $1000</option>
                                </select>
                            </div>
                        </div>

                        <!-- Sort Options -->
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    v-model="sortBy"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Customer Name</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="city">City</option>
                                    <option value="country">Country</option>
                                    <option value="total_amount">Total Amount</option>
                                    <option value="sale_count">Sales Count</option>
                                    <option value="created_at">Created Date</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                <select
                                    v-model="sortOrder"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Customers Table -->
                <div class="bg-transparent rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-700 border border-gray-500">
                        <thead class="bg-transparent border border-gray-500">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.name') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.email') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.phone') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.address') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.total_amount') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.number_of_sales') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.status') }}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.created_at') }}</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('Customer.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-900 divide-y divide-gray-700">
                            <tr v-for="customer in filteredCustomers" :key="customer.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ customer.id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-300">{{ customer.name }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ customer.email || '—' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-300">{{ customer.phone || '—' }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-300">
                                        {{ [customer.address, customer.city, customer.country].filter(Boolean).join(', ') || '—' }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatCurrency(customer.total_amount_count) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ customer.sale_count }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span 
                                        @click="toggleCustomerStatus(customer.id)" 
                                        :class="getStatusClass(customer.is_active)"
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                        :title="customer.is_active ? 'Click to deactivate' : 'Click to activate'"
                                    >
                                        <span class="w-2 h-2 mr-1 rounded-full" :class="getStatusDotClass(customer.is_active)"></span>
                                        {{ customer.is_active ? t('Customer.active') : t('Customer.inactive') }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ formatDate(customer.created_at) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button @click="editCustomer(customer)" class="text-blue-400 hover:text-blue-300 mr-3">
                                        <span class="material-icons-outlined">edit</span>
                                    </button>
                                    <button @click="showDeleteConfirmation(customer)" class="text-red-400 hover:text-red-300">
                                        <span class="material-icons-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredCustomers.length === 0">
                                <td colspan="10" class="px-6 py-12 text-center">
                                    <div class="flex flex-col items-center">
                                        <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        <h3 class="text-lg font-medium text-gray-900 mb-2">
                                            {{ (searchQuery || activeFiltersCount > 0) ? 'No customers match your search criteria' : 'No customers found' }}
                                        </h3>
                                        <p class="text-gray-500 mb-4">
                                            {{ (searchQuery || activeFiltersCount > 0) ? 'Try adjusting your search terms or filters' : 'Start by adding some customers to your database.' }}
                                        </p>
                                        <button
                                            v-if="searchQuery || activeFiltersCount > 0"
                                            @click="clearAllFilters"
                                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showAddForm || showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ showEditForm ? t('Customer.Edit') : t('Customer.Add') }}</h3>
                    <button @click="closeForm" class="text-gray-400 hover:text-gray-600">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.name') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.name" 
                                required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.name')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.email') }}</label>
                            <input 
                                type="email" 
                                v-model="formData.email" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="email@example.com"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.phone') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.phone" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.phone')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.tax_number') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.tax_number" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.tax_number')"
                            >
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.address') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.address" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.address')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.city') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.city" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.city')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.country') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.country" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.country')"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Customer.postal_code') }}</label>
                            <input 
                                type="text" 
                                v-model="formData.postal_code" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                :placeholder="t('Customer.postal_code')"
                            >
                        </div>
                        <div class="md:col-span-2">
                            <label class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    v-model="formData.is_active" 
                                    :true-value="1"
                                    :false-value="0"
                                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                <span class="ml-2 text-sm text-gray-700">{{ t('Customer.active') }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeForm" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {{ loading ? 'Saving...' : (showEditForm ? t('Customer.Update') : t('Customer.Create')) }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Loading Spinner -->
        <LoadingSpinner 
            v-if="isLoading || isExporting || isDeleting || isTogglingStatus"
            :message="getLoadingMessage()"
            :fullscreen="true"
        />
        
        <!-- Confirmation Dialog for Delete -->
        <ConfirmationDialog
            :is-open="showDeleteConfirm"
            :title="'Delete Customer'"
            :message="`Are you sure you want to delete ${customerToDelete?.name || 'this customer'}? This action cannot be undone.`"
            :type="'error'"
            :confirm-text="'Delete'"
            :cancel-text="'Cancel'"
            :is-loading="isDeleting"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCustomerStore } from '../../stores/customers.store'
import { useI18n } from 'vue-i18n'
import { exportCustomers } from '@/utils/exportUtils'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { useToast } from '@/utils/toastManager'
import { useErrorHandler } from '@/utils/errorHandler'
import { formatCurrency } from '@/utils/currency'

// Composables
const { t } = useI18n()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()
const { handleNetworkError, handleDatabaseError, handleValidationError, handleBusinessLogicError } = useErrorHandler()

// Stores
const customerStore = useCustomerStore()

// Reactive Variables
const searchQuery = ref('')
const showAddForm = ref(false)
const showEditForm = ref(false)
const selectedCustomer = ref(null)
const loading = ref(false)
const showExportDropdown = ref(false)

// Advanced filter variables
const statusFilter = ref('')
const cityFilter = ref('')
const countryFilter = ref('')
const salesRangeFilter = ref('')
const amountRangeFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const showAdvancedFilters = ref(false)

// Loading states
const isLoading = ref(false)
const isExporting = ref(false)
const isDeleting = ref(false)
const isTogglingStatus = ref(false)

// Confirmation dialog state
const showDeleteConfirm = ref(false)
const customerToDelete = ref(null)

// Helper methods
const getLoadingMessage = () => {
  if (isLoading.value) return 'Loading customers...'
  if (isExporting.value) return 'Exporting data...'
  if (isDeleting.value) return 'Deleting customer...'
  if (isTogglingStatus.value) return 'Updating status...'
  return 'Processing...'
}

const confirmDelete = async () => {
  if (customerToDelete.value?.id) {
    await deleteCustomer(customerToDelete.value.id)
  }
  showDeleteConfirm.value = false
  customerToDelete.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  customerToDelete.value = null
}

// Clear all filters method
const clearAllFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  cityFilter.value = ''
  countryFilter.value = ''
  salesRangeFilter.value = ''
  amountRangeFilter.value = ''
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  showAdvancedFilters.value = false
  
  showInfo('Filters Cleared', 'All search and filter options have been reset')
}

// Handle search input key events
const handleSearchKeydown = (event) => {
  if (event.key === 'Enter') {
    // Focus on first result or show advanced filters
    if (filteredCustomers.value.length === 0) {
      showAdvancedFilters.value = true
    }
  } else if (event.key === 'Escape') {
    searchQuery.value = ''
    showAdvancedFilters.value = false
  }
}

const formData = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    tax_number: '',
    is_active: 1
})

// Computed Properties
const customers = computed(() => customerStore.getCustomers || [])

// Unique values for filter dropdowns
const uniqueCities = computed(() => {
  const cities = [...new Set(customers.value.map(c => c.city).filter(Boolean))]
  return cities.sort()
})

const uniqueCountries = computed(() => {
  const countries = [...new Set(customers.value.map(c => c.country).filter(Boolean))]
  return countries.sort()
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (statusFilter.value) count++
  if (cityFilter.value) count++
  if (countryFilter.value) count++
  if (salesRangeFilter.value) count++
  if (amountRangeFilter.value) count++
  return count
})

// Advanced search and filter implementation
const filteredCustomers = computed(() => {
  if (!Array.isArray(customers.value) || customers.value.length === 0) {
    return []
  }
  
  let filtered = [...customers.value]
  
  // Text search - search in name, email, phone, address, city, country, tax_number
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(customer => {
      const name = (customer.name || '').toLowerCase()
      const email = (customer.email || '').toLowerCase()
      const phone = (customer.phone || '').toLowerCase()
      const address = (customer.address || '').toLowerCase()
      const city = (customer.city || '').toLowerCase()
      const country = (customer.country || '').toLowerCase()
      const taxNumber = (customer.tax_number || '').toLowerCase()
      
      return name.includes(query) ||
             email.includes(query) ||
             phone.includes(query) ||
             address.includes(query) ||
             city.includes(query) ||
             country.includes(query) ||
             taxNumber.includes(query)
    })
  }
  
  // Status filter
  if (statusFilter.value && statusFilter.value !== '') {
    filtered = filtered.filter(customer => {
      switch (statusFilter.value) {
        case 'active':
          return customer.is_active === 1 || customer.is_active === true
        case 'inactive':
          return customer.is_active === 0 || customer.is_active === false
        default:
          return true
      }
    })
  }
  
  // City filter
  if (cityFilter.value && cityFilter.value !== '') {
    filtered = filtered.filter(customer => 
      customer.city === cityFilter.value
    )
  }
  
  // Country filter
  if (countryFilter.value && countryFilter.value !== '') {
    filtered = filtered.filter(customer => 
      customer.country === countryFilter.value
    )
  }
  
  // Sales range filter
  if (salesRangeFilter.value && salesRangeFilter.value !== '') {
    filtered = filtered.filter(customer => {
      const salesCount = Number(customer.sale_count) || 0
      
      switch (salesRangeFilter.value) {
        case 'none':
          return salesCount === 0
        case 'low':
          return salesCount >= 1 && salesCount <= 5
        case 'medium':
          return salesCount >= 6 && salesCount <= 20
        case 'high':
          return salesCount >= 21 && salesCount <= 50
        case 'vip':
          return salesCount > 50
        default:
          return true
      }
    })
  }
  
  // Amount range filter
  if (amountRangeFilter.value && amountRangeFilter.value !== '') {
    filtered = filtered.filter(customer => {
      const totalAmount = Number(customer.total_amount_count) || 0
      
      switch (amountRangeFilter.value) {
        case 'none':
          return totalAmount === 0
        case 'low':
          return totalAmount > 0 && totalAmount < 100
        case 'medium':
          return totalAmount >= 100 && totalAmount < 500
        case 'high':
          return totalAmount >= 500 && totalAmount < 1000
        case 'vip':
          return totalAmount >= 1000
        default:
          return true
      }
    })
  }
  
  // Sort customers
  if (sortBy.value && sortBy.value !== '') {
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy.value) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'email':
          aValue = (a.email || '').toLowerCase()
          bValue = (b.email || '').toLowerCase()
          break
        case 'phone':
          aValue = (a.phone || '').toLowerCase()
          bValue = (b.phone || '').toLowerCase()
          break
        case 'city':
          aValue = (a.city || '').toLowerCase()
          bValue = (b.city || '').toLowerCase()
          break
        case 'country':
          aValue = (a.country || '').toLowerCase()
          bValue = (b.country || '').toLowerCase()
          break
        case 'total_amount':
          aValue = Number(a.total_amount_count) || 0
          bValue = Number(b.total_amount_count) || 0
          break
        case 'sale_count':
          aValue = Number(a.sale_count) || 0
          bValue = Number(b.sale_count) || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at || 0)
          bValue = new Date(b.created_at || 0)
          break
        default:
          return 0
      }
      
      if (sortOrder.value === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
  }
  
  return filtered
})

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
}

// Using centralized formatCurrency from currency.ts

const closeForm = () => {
    showAddForm.value = false
    showEditForm.value = false
    selectedCustomer.value = null
    formData.value = { 
        name: '', email: '', phone: '', address: '', 
        city: '', country: '', postal_code: '', tax_number: '', is_active: 1
    }
}

const editCustomer = (customer) => {
    selectedCustomer.value = customer
    formData.value = {
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        postal_code: customer.postal_code || '',
        tax_number: customer.tax_number || '',
        is_active: customer.is_active !== undefined ? customer.is_active : 1
    }
    showEditForm.value = true
}

const handleSubmit = async () => {
    try {
        loading.value = true
        
        // Validate required fields
        if (!formData.value.name || !formData.value.name.trim()) {
            handleValidationError(new Error('Customer name is required'), 'Customer Form')
            showError('Validation Error', 'Customer name is required')
            return
        }

        // Validate email format if provided
        if (formData.value.email && formData.value.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.value.email.trim())) {
                handleValidationError(new Error('Invalid email format'), 'Customer Form')
                showError('Validation Error', 'Please enter a valid email address')
                return
            }
        }

        // Validate phone format if provided
        if (formData.value.phone && formData.value.phone.trim()) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
            if (!phoneRegex.test(formData.value.phone.trim().replace(/[\s\-\(\)]/g, ''))) {
                handleValidationError(new Error('Invalid phone format'), 'Customer Form')
                showError('Validation Error', 'Please enter a valid phone number')
                return
            }
        }

        const cleanData = {
            name: String(formData.value.name || '').trim(),
            email: String(formData.value.email || '').trim(),
            phone: String(formData.value.phone || '').trim(),
            address: String(formData.value.address || '').trim(),
            city: String(formData.value.city || '').trim(),
            country: String(formData.value.country || '').trim(),
            postal_code: String(formData.value.postal_code || '').trim(),
            tax_number: String(formData.value.tax_number || '').trim(),
            is_active: Number(formData.value.is_active || 1),
        }

        if (showEditForm.value && selectedCustomer.value) {
            showInfo('Updating Customer', 'Saving customer changes...')
            await customerStore.update(selectedCustomer.value.id, cleanData)
            showSuccess('Customer Updated', 'Customer has been updated successfully')
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Customer Updated', `${cleanData.name} has been updated`)
            }
        } else {
            showInfo('Creating Customer', 'Adding new customer...')
            await customerStore.create(cleanData)
            showSuccess('Customer Created', 'New customer has been created successfully')
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Customer Created', `${cleanData.name} has been added`)
            }
        }
        
        // Ensure latest data is visible immediately
        await customerStore.fetchCustomers()
        closeForm()
        
    } catch (error) {
        if (error.message?.includes('UNIQUE constraint') || error.message?.includes('duplicate')) {
            handleDatabaseError(error, 'Customer Form')
            showError('Duplicate Customer', 'A customer with this email or phone number already exists')
        } else if (error.message?.includes('validation') || error.message?.includes('required')) {
            handleValidationError(error, 'Customer Form')
            showError('Validation Error', error.message)
        } else {
            handleNetworkError(error, 'Customer Form')
            showError('Save Failed', 'Failed to save customer. Please try again.')
        }
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Save Failed', 'Could not save customer')
        }
    } finally {
        loading.value = false
    }
}

const deleteCustomer = async (id) => {
    try {
        isDeleting.value = true
        
        // Find the customer to get their name for the notification
        const customer = customers.value.find(c => c.id === id)
        const customerName = customer?.name || 'Customer'
        
        showInfo('Deleting Customer', `Removing ${customerName}...`)
        
        await customerStore.delete(id)
        await customerStore.fetchCustomers()
        
        showSuccess('Customer Deleted', `${customerName} has been deleted successfully`)
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Customer Deleted', `${customerName} has been removed`)
        }
        
    } catch (error) {
        if (error.message?.includes('foreign key') || error.message?.includes('constraint')) {
            handleDatabaseError(error, 'Customer Deletion')
            showError('Cannot Delete Customer', 'This customer has associated sales records and cannot be deleted')
        } else {
            handleNetworkError(error, 'Customer Deletion')
            showError('Delete Failed', 'Failed to delete customer. Please try again.')
        }
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Delete Failed', 'Could not delete customer')
        }
    } finally {
        isDeleting.value = false
    }
}

// Show delete confirmation
const showDeleteConfirmation = (customer) => {
    customerToDelete.value = customer
    showDeleteConfirm.value = true
}

// Export customers
const exportCustomersData = async (format) => {
    try {
        isExporting.value = true
        showInfo('Exporting Data', `Preparing ${format.toUpperCase()} export...`)
        
        if (!customers.value || customers.value.length === 0) {
            handleBusinessLogicError(new Error('No customers to export'), 'Customer Export')
            showWarning('No Data', 'There are no customers to export')
            return
        }
        
        const success = await exportCustomers(customers.value, format)
        
        if (success) {
            showSuccess('Export Complete', `Customers exported successfully as ${format.toUpperCase()}`)
            
            // Add notification
            if (window.addNotification) {
                window.addNotification('success', 'Export Complete', `${customers.value.length} customers exported as ${format.toUpperCase()}`)
            }
        } else {
            handleBusinessLogicError(new Error('Export operation failed'), 'Customer Export')
            showError('Export Failed', 'Failed to export customers data')
        }
        
    } catch (error) {
        handleNetworkError(error, 'Customer Export')
        showError('Export Error', 'An error occurred while exporting data. Please try again.')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Export Failed', 'Could not export customers')
        }
    } finally {
        isExporting.value = false
        showExportDropdown.value = false
    }
}

// Toggle customer status
const toggleCustomerStatus = async (id) => {
    try {
        isTogglingStatus.value = true
        
        const customer = customers.value.find(c => c.id === id)
        const customerName = customer?.name || 'Customer'
        const newStatus = customer?.is_active ? 'inactive' : 'active'
        
        showInfo('Updating Status', `Setting ${customerName} to ${newStatus}...`)
        
        await customerStore.toggleStatus(id)
        
        showSuccess('Status Updated', `${customerName} is now ${newStatus}`)
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('success', 'Status Updated', `${customerName} is now ${newStatus}`)
        }
        
    } catch (error) {
        handleNetworkError(error, 'Customer Status Toggle')
        showError('Status Update Failed', 'Failed to update customer status. Please try again.')
        
        // Add notification
        if (window.addNotification) {
            window.addNotification('error', 'Status Update Failed', 'Could not update customer status')
        }
    } finally {
        isTogglingStatus.value = false
    }
}

// Status styling helpers
const getStatusClass = (isActive) => {
    return isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
}

const getStatusDotClass = (isActive) => {
    return isActive ? 'bg-green-400' : 'bg-red-400'
}

// Lifecycle Hooks
onMounted(async () => {
    try {
        isLoading.value = true
        showInfo('Loading Customers', 'Fetching customer data...')
        
        await customerStore.fetchCustomers()
        
        showSuccess('Customers Loaded', 'Customer data loaded successfully')
        
    } catch (error) {
        handleNetworkError(error, 'Customer Data Loading')
        showError('Loading Failed', 'Failed to load customer data. Please refresh the page.')
    } finally {
        isLoading.value = false
    }
})

onUnmounted(() => {
    // Cleanup if needed
})
</script>

<style scoped>
.btn {
    @apply transition-colors duration-200;
}

.btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* Dark theme adjustments */
:deep(.bg-blue-100) {
    @apply bg-blue-900/30;
}

:deep(.text-blue-600) {
    @apply text-blue-400;
}

:deep(.bg-green-100) {
    @apply bg-green-900/30;
}

:deep(.text-green-600) {
    @apply text-green-400;
}

:deep(.bg-purple-100) {
    @apply bg-purple-900/30;
}

:deep(.text-purple-600) {
    @apply text-purple-400;
}

/* Custom styles for filter buttons */
.filter-button {
  @apply px-4 py-2 rounded-lg transition-colors duration-200;
}

.filter-button:hover {
  @apply shadow-sm;
}

/* Search input dark theme */
.dark input[type="text"] {
    @apply bg-gray-800 border-gray-600 text-gray-200;
}

.dark input[type="text"]:focus {
    @apply ring-blue-500 border-blue-500;
}

/* Select dropdown dark theme */
.dark select {
    @apply bg-gray-800 border-gray-600 text-gray-200;
}

.dark select:focus {
    @apply ring-blue-500 border-blue-500;
}

/* Additional dark theme adjustments for new elements */
:deep(.bg-gray-50) {
    @apply dark:bg-gray-800;
}

:deep(.text-gray-700) {
    @apply dark:text-gray-300;
}

:deep(.text-gray-600) {
    @apply dark:text-gray-400;
}

:deep(.border-gray-300) {
    @apply dark:border-gray-600;
}

:deep(.text-gray-900) {
    @apply dark:text-gray-100;
}

:deep(.text-gray-500) {
    @apply dark:text-gray-400;
}
</style>
